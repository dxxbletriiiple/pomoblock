import { MS_PER_MINUTE } from '../constants';

export function minutesToMs(minutes: number): number {
	return minutes * MS_PER_MINUTE;
}

export function formatTimerClock(ms: number): string {
	const total = Math.max(0, Math.ceil(ms / 1000));
	const minutes = Math.floor(total / 60);
	const seconds = total % 60;
	return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
