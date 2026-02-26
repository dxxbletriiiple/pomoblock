import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_STATE, TIMER_ALARM_NAME } from '../src/shared/constants';
import type { AppState, TimerState } from '../src/shared/types';

vi.mock('../src/background/blocking', () => ({
	applyBlockingRules: vi.fn(),
}));

import { applyBlockingRules } from '../src/background/blocking';
import { handlePhaseEnd, startPhase } from '../src/background/timer';

const applyBlockingRulesMock = vi.mocked(applyBlockingRules);
const clearAlarm = vi.fn<(name: string) => Promise<void>>();
const createAlarm = vi.fn<(name: string, info: { when: number }) => Promise<void>>();

function installChromeAlarmsMock() {
	(
		globalThis as typeof globalThis & {
			chrome?: {
				alarms: {
					clear: typeof clearAlarm;
					create: typeof createAlarm;
				};
			};
		}
	).chrome = {
		alarms: {
			clear: clearAlarm,
			create: createAlarm,
		},
	};
}

function createState(
	overrides: {
		settings?: Partial<AppState['settings']>;
		blockedSites?: string[];
		timer?: Partial<AppState['timer']>;
	} = {},
): AppState {
	return {
		settings: {
			...DEFAULT_STATE.settings,
			...(overrides.settings ?? {}),
		},
		blockedSites: overrides.blockedSites ?? ['example.com'],
		timer: {
			...DEFAULT_STATE.timer,
			...(overrides.timer ?? {}),
		},
	};
}

describe('startPhase', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		installChromeAlarmsMock();
		applyBlockingRulesMock.mockResolvedValue();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('patches timer state and schedules an alarm for a work phase', async () => {
		vi.spyOn(Date, 'now').mockReturnValue(1_000);
		const state = createState();
		const patchTimer = vi
			.fn<(patch: Partial<TimerState>) => Promise<AppState>>()
			.mockResolvedValue(state);

		await startPhase({ getState: vi.fn(), patchTimer }, 'work', 5_000);

		expect(patchTimer).toHaveBeenCalledWith({
			phase: 'work',
			status: 'running',
			endTime: 6_000,
			remainingMs: null,
		});
		expect(clearAlarm).toHaveBeenCalledWith(TIMER_ALARM_NAME);
		expect(createAlarm).toHaveBeenCalledWith(TIMER_ALARM_NAME, {
			when: 6_000,
		});
		expect(applyBlockingRulesMock).toHaveBeenCalledWith(
			state.blockedSites,
			true,
		);
	});

	it('passes through extra timer patch fields', async () => {
		vi.spyOn(Date, 'now').mockReturnValue(2_000);
		const patchTimer = vi
			.fn<(patch: Partial<TimerState>) => Promise<AppState>>()
			.mockResolvedValue(createState());

		await startPhase(
			{ getState: vi.fn(), patchTimer },
			'work',
			10_000,
			{ completedSessions: 3 },
		);

		expect(patchTimer).toHaveBeenCalledWith({
			completedSessions: 3,
			phase: 'work',
			status: 'running',
			endTime: 12_000,
			remainingMs: null,
		});
	});

	it('disables blocking during break phases', async () => {
		vi.spyOn(Date, 'now').mockReturnValue(3_000);
		const state = createState({ blockedSites: ['a.com', 'b.com'] });
		const patchTimer = vi
			.fn<(patch: Partial<TimerState>) => Promise<AppState>>()
			.mockResolvedValue(state);

		await startPhase(
			{ getState: vi.fn(), patchTimer },
			'shortBreak',
			1_000,
		);

		expect(applyBlockingRulesMock).toHaveBeenCalledWith(
			state.blockedSites,
			false,
		);
	});
});

describe('handlePhaseEnd', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		installChromeAlarmsMock();
		applyBlockingRulesMock.mockResolvedValue();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('does nothing when timer is not running', async () => {
		const state = createState({
			timer: { status: 'paused' },
		});
		const patchTimer = vi
			.fn<(patch: Partial<TimerState>) => Promise<AppState>>()
			.mockResolvedValue(state);

		await handlePhaseEnd({
			getState: vi.fn().mockResolvedValue(state),
			patchTimer,
		});

		expect(patchTimer).not.toHaveBeenCalled();
		expect(createAlarm).not.toHaveBeenCalled();
		expect(applyBlockingRulesMock).not.toHaveBeenCalled();
	});

	it('moves work phase to short break before reaching cycle limit', async () => {
		vi.spyOn(Date, 'now').mockReturnValue(10_000);
		const state = createState({
			timer: {
				status: 'running',
				phase: 'work',
				completedSessions: 1,
			},
			settings: { shortBreak: 5, cycles: 4 },
		});
		const patchTimer = vi
			.fn<(patch: Partial<TimerState>) => Promise<AppState>>()
			.mockImplementation(async (patch) =>
				createState({
					...state,
					timer: { ...state.timer, ...patch },
				}),
			);

		await handlePhaseEnd({
			getState: vi.fn().mockResolvedValue(state),
			patchTimer,
		});

		expect(patchTimer).toHaveBeenCalledWith({
			completedSessions: 2,
			phase: 'shortBreak',
			status: 'running',
			endTime: 310_000,
			remainingMs: null,
		});
		expect(applyBlockingRulesMock).toHaveBeenCalledWith(
			state.blockedSites,
			false,
		);
	});

	it('moves work phase to long break when cycle limit is reached', async () => {
		vi.spyOn(Date, 'now').mockReturnValue(20_000);
		const state = createState({
			timer: {
				status: 'running',
				phase: 'work',
				completedSessions: 3,
			},
			settings: { longBreak: 15, cycles: 4 },
		});
		const patchTimer = vi
			.fn<(patch: Partial<TimerState>) => Promise<AppState>>()
			.mockImplementation(async (patch) =>
				createState({
					...state,
					timer: { ...state.timer, ...patch },
				}),
			);

		await handlePhaseEnd({
			getState: vi.fn().mockResolvedValue(state),
			patchTimer,
		});

		expect(patchTimer).toHaveBeenCalledWith({
			completedSessions: 4,
			phase: 'longBreak',
			status: 'running',
			endTime: 920_000,
			remainingMs: null,
		});
		expect(applyBlockingRulesMock).toHaveBeenCalledWith(
			state.blockedSites,
			false,
		);
	});

	it('moves short break phase back to work', async () => {
		vi.spyOn(Date, 'now').mockReturnValue(30_000);
		const state = createState({
			timer: {
				status: 'running',
				phase: 'shortBreak',
				completedSessions: 2,
			},
			settings: { workTime: 25 },
		});
		const patchTimer = vi
			.fn<(patch: Partial<TimerState>) => Promise<AppState>>()
			.mockImplementation(async (patch) =>
				createState({
					...state,
					timer: { ...state.timer, ...patch },
				}),
			);

		await handlePhaseEnd({
			getState: vi.fn().mockResolvedValue(state),
			patchTimer,
		});

		expect(patchTimer).toHaveBeenCalledWith({
			phase: 'work',
			status: 'running',
			endTime: 1_530_000,
			remainingMs: null,
		});
		expect(applyBlockingRulesMock).toHaveBeenCalledWith(
			state.blockedSites,
			true,
		);
	});

	it('resets to default timer state after long break and unblocks sites', async () => {
		const state = createState({
			timer: {
				status: 'running',
				phase: 'longBreak',
				completedSessions: 4,
			},
			blockedSites: ['x.com'],
		});
		const nextState = createState({
			blockedSites: state.blockedSites,
			timer: { ...DEFAULT_STATE.timer },
		});
		const patchTimer = vi
			.fn<(patch: Partial<TimerState>) => Promise<AppState>>()
			.mockResolvedValue(nextState);

		await handlePhaseEnd({
			getState: vi.fn().mockResolvedValue(state),
			patchTimer,
		});

		expect(patchTimer).toHaveBeenCalledWith({ ...DEFAULT_STATE.timer });
		expect(createAlarm).not.toHaveBeenCalled();
		expect(applyBlockingRulesMock).toHaveBeenCalledWith(
			nextState.blockedSites,
			false,
		);
	});
});
