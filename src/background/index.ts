import {
	APP_STATE_STORAGE_KEY,
	DEFAULT_STATE,
	TIMER_ALARM_NAME,
} from '../shared/constants';
import { AppMessage, AppState, MessageResponse, TimerState } from '../shared/types';
import { minutesToMs } from '../shared/utils';
import { applyBlockingRules } from './blocking';
import { handlePhaseEnd, startPhase } from './timer';

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

const timerRuntime = { getState, patchTimer };

// ─── Alarm listener ───────────────────────────────────────────────────────────

chrome.alarms.onAlarm.addListener(async (alarm) => {
	if (alarm.name === TIMER_ALARM_NAME) {
		await handlePhaseEnd(timerRuntime);
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
				timerRuntime,
				'work',
				minutesToMs(state.settings.workTime),
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
				timerRuntime,
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
			await handlePhaseEnd(timerRuntime);
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
