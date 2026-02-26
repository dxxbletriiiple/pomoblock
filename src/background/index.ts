import {
	APP_STATE_STORAGE_KEY,
	DEFAULT_STATE,
	MS_PER_MINUTE,
	TIMER_ALARM_NAME,
} from '../shared/constants/constants';
import {
	AppMessage,
	AppState,
	MessageResponse,
	TimerPhase,
	TimerState,
} from '../shared/types/types';

// ─── Storage ─────────────────────────────────────────────────────────────────

async function getState(): Promise<AppState> {
	const data = await chrome.storage.local.get(APP_STATE_STORAGE_KEY);
	const appState = data[APP_STATE_STORAGE_KEY];
	if (!appState) return { ...DEFAULT_STATE };
	return {
		settings: { ...DEFAULT_STATE.settings, ...appState.settings },
		blockedSites: appState.blockedSites ?? [],
		timer: { ...DEFAULT_STATE.timer, ...appState.timer },
	};
}

async function saveState(state: AppState): Promise<void> {
	await chrome.storage.local.set({ [APP_STATE_STORAGE_KEY]: state });
}

async function patchTimer(patch: Partial<TimerState>): Promise<AppState> {
	const state = await getState();
	const next: AppState = { ...state, timer: { ...state.timer, ...patch } };
	await saveState(next);
	return next;
}

// ─── Domain helpers ───────────────────────────────────────────────────────────

function normalizeDomain(input: string): string {
	return input
		.toLowerCase()
		.trim()
		.replace(/^https?:\/\//, '')
		.split('/')[0]
		.split('?')[0]
		.replace(/^www\./, '');
}

// ─── Blocking ─────────────────────────────────────────────────────────────────

async function applyBlockingRules(
	sites: string[],
	active: boolean,
): Promise<void> {
	const existing = await chrome.declarativeNetRequest.getDynamicRules();
	const removeRuleIds = existing.map((r) => r.id);

	if (!active || sites.length === 0) {
		if (removeRuleIds.length > 0) {
			await chrome.declarativeNetRequest.updateDynamicRules({
				removeRuleIds,
			});
		}
		return;
	}

	const rules: chrome.declarativeNetRequest.Rule[] = [];
	sites.forEach((raw, idx) => {
		const domain = normalizeDomain(raw);
		if (!domain) return;

		const baseId = (idx + 1) * 2;
		// Block bare domain
		rules.push({
			id: baseId - 1,
			priority: 1,
			action: {
				type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
				redirect: { extensionPath: '/blocked.html' },
			},
			condition: {
				urlFilter: `||${domain}^`,
				resourceTypes: [
					chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
				],
			},
		});
		// Block www variant
		rules.push({
			id: baseId,
			priority: 1,
			action: {
				type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
				redirect: { extensionPath: '/blocked.html' },
			},
			condition: {
				urlFilter: `||www.${domain}^`,
				resourceTypes: [
					chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
				],
			},
		});
	});

	await chrome.declarativeNetRequest.updateDynamicRules({
		removeRuleIds,
		addRules: rules,
	});
}

// ─── Timer logic ──────────────────────────────────────────────────────────────

async function startPhase(
	phase: TimerPhase,
	durationMs: number,
	extraPatch: Partial<TimerState> = {},
): Promise<AppState> {
	const endTime = Date.now() + durationMs;
	const state = await patchTimer({
		...extraPatch,
		phase,
		status: 'running',
		endTime,
		remainingMs: null,
	});

	await chrome.alarms.clear(TIMER_ALARM_NAME);
	await chrome.alarms.create(TIMER_ALARM_NAME, { when: endTime });
	await applyBlockingRules(state.blockedSites, phase === 'work');
	return state;
}

async function handlePhaseEnd(): Promise<void> {
	const state = await getState();
	const { timer, settings } = state;
	if (timer.status !== 'running') return;

	if (timer.phase === 'work') {
		const completed = timer.completedSessions + 1;
		if (completed >= settings.cycles) {
			await startPhase('longBreak', settings.longBreak * MS_PER_MINUTE, {
				completedSessions: completed,
			});
		} else {
			await startPhase(
				'shortBreak',
				settings.shortBreak * MS_PER_MINUTE,
				{ completedSessions: completed },
			);
		}
	} else if (timer.phase === 'shortBreak') {
		await startPhase('work', settings.workTime * MS_PER_MINUTE);
	} else {
		// Long break ended → back to idle
		const next = await patchTimer({ ...DEFAULT_STATE.timer });
		await applyBlockingRules(next.blockedSites, false);
	}
}

// ─── Alarm listener ───────────────────────────────────────────────────────────

chrome.alarms.onAlarm.addListener(async (alarm) => {
	if (alarm.name === TIMER_ALARM_NAME) {
		await handlePhaseEnd();
	}
});

// ─── Message handler ──────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener(
	(
		message: AppMessage,
		_sender,
		sendResponse: (r: MessageResponse) => void,
	) => {
		handleMessage(message)
			.then(sendResponse)
			.catch((err) =>
				sendResponse({ success: false, error: String(err) }),
			);
		return true; // async response
	},
);

async function handleMessage(msg: AppMessage): Promise<MessageResponse> {
	const state = await getState();

	switch (msg.type) {
		case 'GET_STATE':
			return { success: true, state };

		case 'START': {
			if (state.timer.status !== 'idle') return { success: true, state };
			const next = await startPhase(
				'work',
				state.settings.workTime * MS_PER_MINUTE,
				{
					completedSessions: 0,
				},
			);
			return { success: true, state: next };
		}

		case 'PAUSE': {
			if (state.timer.status !== 'running' || !state.timer.endTime)
				return { success: true, state };
			const remainingMs = Math.max(0, state.timer.endTime - Date.now());
			await chrome.alarms.clear(TIMER_ALARM_NAME);
			const next = await patchTimer({
				status: 'paused',
				remainingMs,
				endTime: null,
			});
			await applyBlockingRules(next.blockedSites, false);
			return { success: true, state: next };
		}

		case 'RESUME': {
			if (
				state.timer.status !== 'paused' ||
				state.timer.remainingMs == null
			)
				return { success: true, state };
			const next = await startPhase(
				state.timer.phase,
				state.timer.remainingMs,
				{
					completedSessions: state.timer.completedSessions,
				},
			);
			return { success: true, state: next };
		}

		case 'RESET': {
			await chrome.alarms.clear(TIMER_ALARM_NAME);
			const next = await patchTimer({ ...DEFAULT_STATE.timer });
			await applyBlockingRules(next.blockedSites, false);
			return { success: true, state: next };
		}

		case 'SKIP': {
			await chrome.alarms.clear(TIMER_ALARM_NAME);
			await handlePhaseEnd();
			return { success: true, state: await getState() };
		}

		case 'UPDATE_SITES': {
			const next: AppState = { ...state, blockedSites: msg.sites };
			await saveState(next);
			const blocking =
				next.timer.status === 'running' && next.timer.phase === 'work';
			await applyBlockingRules(msg.sites, blocking);
			return { success: true, state: next };
		}

		case 'UPDATE_SETTINGS': {
			const next: AppState = {
				...state,
				settings: { ...state.settings, ...msg.settings },
			};
			await saveState(next);
			return { success: true, state: next };
		}

		default:
			return { success: false, error: 'Unknown message type' };
	}
}

// ─── Install hook ─────────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async () => {
	const data = await chrome.storage.local.get(APP_STATE_STORAGE_KEY);
	if (!data[APP_STATE_STORAGE_KEY]) {
		await saveState(DEFAULT_STATE);
	}
});
