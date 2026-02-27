import {
	APP_STATE_STORAGE_KEY,
	BLOCKED_PAGE_EXTENSION_PATH,
	DEFAULT_STATE,
	TIMER_ALARM_NAME,
} from '../shared/constants';
import { AppMessage, AppState, MessageResponse, TimerState } from '../shared/types';
import { minutesToMs } from '../shared/utils';
import { applyBlockingRules, normalizeDomain } from './blocking';
import { handlePhaseEnd, startPhase } from './timer';

const REDIRECTED_TABS_KEY = 'redirectedTabs';

type RedirectedTabs = Record<string, string>;

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

async function getRedirectedTabs(): Promise<RedirectedTabs> {
	const data = await chrome.storage.session.get(REDIRECTED_TABS_KEY);
	const value = data[REDIRECTED_TABS_KEY];
	if (!value || typeof value !== 'object') return {};
	return value as RedirectedTabs;
}

async function setRedirectedTabs(tabs: RedirectedTabs): Promise<void> {
	if (Object.keys(tabs).length === 0) {
		await chrome.storage.session.remove(REDIRECTED_TABS_KEY);
		return;
	}
	await chrome.storage.session.set({ [REDIRECTED_TABS_KEY]: tabs });
}

function isBlockedHost(host: string, sites: string[]): boolean {
	return sites.some((raw) => {
		const domain = normalizeDomain(raw);
		if (!domain) return false;
		return host === domain || host.endsWith(`.${domain}`);
	});
}

function shouldBlockTabUrl(url: string, sites: string[]): boolean {
	try {
		const parsed = new URL(url);
		if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
			return false;
		}
		const host = normalizeDomain(parsed.hostname);
		if (!host) return false;
		return isBlockedHost(host, sites);
	} catch {
		return false;
	}
}

async function blockAlreadyOpenTabs(sites: string[]): Promise<void> {
	if (sites.length === 0) {
		await restoreRedirectedTabs();
		return;
	}

	const blockedPageUrl = chrome.runtime.getURL(BLOCKED_PAGE_EXTENSION_PATH);
	const tabs = await chrome.tabs.query({});
	const redirected = await getRedirectedTabs();

	for (const tab of tabs) {
		if (tab.id == null || !tab.url) continue;
		const tabId = String(tab.id);

		if (tab.url.startsWith(blockedPageUrl)) {
			const originalUrl = redirected[tabId];
			if (
				originalUrl &&
				!shouldBlockTabUrl(originalUrl, sites)
			) {
				await chrome.tabs.update(tab.id, { url: originalUrl });
				delete redirected[tabId];
			}
			continue;
		}

		if (!shouldBlockTabUrl(tab.url, sites)) {
			delete redirected[tabId];
			continue;
		}

		if (!redirected[tabId]) {
			redirected[tabId] = tab.url;
		}
		await chrome.tabs.update(tab.id, { url: blockedPageUrl });
	}

	await setRedirectedTabs(redirected);
}

async function restoreRedirectedTabs(): Promise<void> {
	const redirected = await getRedirectedTabs();
	const entries = Object.entries(redirected);
	if (entries.length === 0) return;

	const blockedPageUrl = chrome.runtime.getURL(BLOCKED_PAGE_EXTENSION_PATH);

	for (const [tabIdRaw, originalUrl] of entries) {
		const tabId = Number(tabIdRaw);
		if (!Number.isFinite(tabId)) continue;

		try {
			const tab = await chrome.tabs.get(tabId);
			if (tab.url?.startsWith(blockedPageUrl)) {
				await chrome.tabs.update(tabId, { url: originalUrl });
			}
		} catch {
			// Tab may have been closed; ignore.
		}
	}

	await setRedirectedTabs({});
}

async function syncOpenTabsWithBlocking(state: AppState): Promise<void> {
	const shouldBlockNow =
		state.timer.status === 'running' && state.timer.phase === 'work';
	if (shouldBlockNow) {
		await blockAlreadyOpenTabs(state.blockedSites);
		return;
	}
	await restoreRedirectedTabs();
}

// ─── Alarm listener ───────────────────────────────────────────────────────────

chrome.alarms.onAlarm.addListener(async (alarm) => {
	if (alarm.name === TIMER_ALARM_NAME) {
		await handlePhaseEnd(timerRuntime);
		await syncOpenTabsWithBlocking(await getState());
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
			await syncOpenTabsWithBlocking(next);
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
			await syncOpenTabsWithBlocking(next);
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
			await syncOpenTabsWithBlocking(next);
			return { success: true, state: next };
		}

		case 'RESET': {
			await chrome.alarms.clear(TIMER_ALARM_NAME);
			const next = await patchTimer({ ...DEFAULT_STATE.timer });
			await applyBlockingRules(next.blockedSites, false);
			await syncOpenTabsWithBlocking(next);
			return { success: true, state: next };
		}

		case 'SKIP': {
			await chrome.alarms.clear(TIMER_ALARM_NAME);
			await handlePhaseEnd(timerRuntime);
			const next = await getState();
			await syncOpenTabsWithBlocking(next);
			return { success: true, state: next };
		}

		case 'UPDATE_SITES': {
			const next: AppState = { ...state, blockedSites: msg.sites };
			await saveState(next);
			const blocking =
				next.timer.status === 'running' && next.timer.phase === 'work';
			await applyBlockingRules(msg.sites, blocking);
			await syncOpenTabsWithBlocking(next);
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
	await syncOpenTabsWithBlocking(await getState());
});

chrome.runtime.onStartup.addListener(async () => {
	await syncOpenTabsWithBlocking(await getState());
});
