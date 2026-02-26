import type { AppState, Settings, TimerState } from '../types';

export const WORK_TIMES = [15, 20, 25, 30, 45, 60, 90];
export const SHORT_BREAKS = [5, 10];
export const LONG_BREAKS = [15, 20, 30];
export const CYCLES = [2, 3, 4, 5, 6];

export const TIMER_ALARM_NAME = 'pomoTimer';

export const MS_PER_MINUTE = 60_000;
export const TIMER_TICK_INTERVAL_MS = 250;

export const TIMER_RING_RADIUS = 76;
export const TIMER_RING_CIRCUMFERENCE = 2 * Math.PI * TIMER_RING_RADIUS;

export const DEFAULT_SETTINGS: Settings = {
	workTime: 25,
	shortBreak: 5,
	longBreak: 15,
	cycles: 4,
	theme: 'light',
};

export const DEFAULT_TIMER: TimerState = {
	status: 'idle',
	phase: 'work',
	completedSessions: 0,
	endTime: null,
	remainingMs: null,
};

export const DEFAULT_STATE: AppState = {
	settings: DEFAULT_SETTINGS,
	blockedSites: [],
	timer: DEFAULT_TIMER,
};
