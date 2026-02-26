import { DEFAULT_STATE, TIMER_ALARM_NAME } from '../shared/constants';
import type { AppState, TimerPhase, TimerState } from '../shared/types';
import { minutesToMs } from '../shared/utils';
import { applyBlockingRules } from './blocking';

export interface TimerRuntimeDeps {
	getState: () => Promise<AppState>;
	patchTimer: (patch: Partial<TimerState>) => Promise<AppState>;
}

export async function startPhase(
	deps: TimerRuntimeDeps,
	phase: TimerPhase,
	durationMs: number,
	extraPatch: Partial<TimerState> = {},
): Promise<AppState> {
	const endTime = Date.now() + durationMs;
	const state = await deps.patchTimer({
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

export async function handlePhaseEnd(deps: TimerRuntimeDeps): Promise<void> {
	const state = await deps.getState();
	const { timer, settings } = state;
	if (timer.status !== 'running') return;

	if (timer.phase === 'work') {
		const completed = timer.completedSessions + 1;
		if (completed >= settings.cycles) {
			await startPhase(deps, 'longBreak', minutesToMs(settings.longBreak), {
				completedSessions: completed,
			});
		} else {
			await startPhase(
				deps,
				'shortBreak',
				minutesToMs(settings.shortBreak),
				{ completedSessions: completed },
			);
		}
		return;
	}

	if (timer.phase === 'shortBreak') {
		await startPhase(deps, 'work', minutesToMs(settings.workTime));
		return;
	}

	const next = await deps.patchTimer({ ...DEFAULT_STATE.timer });
	await applyBlockingRules(next.blockedSites, false);
}
