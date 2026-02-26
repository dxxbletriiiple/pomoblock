import { describe, expect, it } from 'vitest';
import { formatTimerClock, minutesToMs } from '../src/shared/utils/time';

describe('minutesToMs', () => {
	it('converts zero minutes', () => {
		expect(minutesToMs(0)).toBe(0);
	});

	it('converts whole minutes to milliseconds', () => {
		expect(minutesToMs(25)).toBe(1_500_000);
	});

	it('supports fractional minutes', () => {
		expect(minutesToMs(1.5)).toBe(90_000);
	});
});

describe('formatTimerClock', () => {
	it('formats zero as 00:00', () => {
		expect(formatTimerClock(0)).toBe('00:00');
	});

	it('clamps negative values to 00:00', () => {
		expect(formatTimerClock(-500)).toBe('00:00');
	});

	it('rounds up partial seconds before formatting', () => {
		expect(formatTimerClock(59_001)).toBe('01:00');
	});

	it('formats minute and second values correctly', () => {
		expect(formatTimerClock(61_000)).toBe('01:01');
	});
});
