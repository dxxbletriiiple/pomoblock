import { useEffect, useState } from 'react';
import { Settings, TimerState } from '../types';
import { phaseDurationMs } from './time';

/**
 * Resolves timer display milliseconds from the current timer state.
 *
 * @param timer Current timer state.
 * @param settings User timer settings.
 * @param now Current unix timestamp in milliseconds.
 * @returns Remaining milliseconds to display.
 */
export function resolveTimerDisplayMs(
	timer: TimerState,
	settings: Settings,
	now = Date.now(),
): number {
	if (timer.status === 'running' && timer.endTime != null) {
		const nowSecond = Math.floor(now / 1000) * 1000;
		return Math.max(0, timer.endTime - nowSecond);
	}
	if (timer.status === 'paused' && timer.remainingMs != null) {
		return timer.remainingMs;
	}
	return phaseDurationMs(timer.phase, settings);
}

/**
 * Keeps timer display updates synchronized to second boundaries so separate
 * extension pages show the same second at the same moment.
 *
 * @param timer Current timer state.
 * @param settings User timer settings.
 * @returns Display milliseconds for rendering.
 */
export function useSynchronizedTimerDisplay(
	timer: TimerState,
	settings: Settings,
): number {
	const [displayMs, setDisplayMs] = useState(() =>
		resolveTimerDisplayMs(timer, settings),
	);

	useEffect(() => {
		const update = () => {
			setDisplayMs(resolveTimerDisplayMs(timer, settings));
		};

		update();
		if (timer.status !== 'running' || timer.endTime == null) return;

		const now = Date.now();
		const msToNextSecond = now % 1000 === 0 ? 0 : 1000 - (now % 1000);
		let intervalId: number | null = null;

		const timeoutId = window.setTimeout(() => {
			update();
			intervalId = window.setInterval(update, 1000);
		}, msToNextSecond);

		return () => {
			window.clearTimeout(timeoutId);
			if (intervalId != null) window.clearInterval(intervalId);
		};
	}, [
		timer.endTime,
		timer.phase,
		timer.remainingMs,
		timer.status,
		settings.longBreak,
		settings.shortBreak,
		settings.workTime,
	]);

	return displayMs;
}
