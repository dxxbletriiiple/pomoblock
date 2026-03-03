import { MS_PER_MINUTE } from '../constants';
import { Settings, TimerState } from '../types';

/**
 * Converts minutes to milliseconds.
 *
 * @param minutes Duration in minutes.
 * @returns Duration in milliseconds.
 */
export function minutesToMs(minutes: number): number {
	return minutes * MS_PER_MINUTE;
}

/**
 * Formats milliseconds as an `mm:ss` timer string.
 * Negative values are clamped to `00:00`.
 *
 * @param ms Remaining time in milliseconds.
 * @returns Formatted timer string.
 */
export function formatTimerClock(ms: number): string {
	const total = Math.max(0, Math.ceil(ms / 1000));
	const minutes = Math.floor(total / 60);
	const seconds = total % 60;
	return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Resolves phase duration from timer settings and returns milliseconds.
 *
 * @param phase Current timer phase.
 * @param settings User timer settings.
 * @returns Duration for the given phase in milliseconds.
 */
export function phaseDurationMs(
	phase: TimerState['phase'],
	settings: Settings,
): number {
	if (phase === 'work') return minutesToMs(settings.workTime);
	if (phase === 'shortBreak') return minutesToMs(settings.shortBreak);
	return minutesToMs(settings.longBreak);
}
