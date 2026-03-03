import { describe, expect, it } from 'vitest';
import { classNames } from '../src/shared/utils';

describe('classNames', () => {
	it('joins plain string values', () => {
		expect(classNames('a', 'b', 'c')).toBe('a b c');
	});

	it('skips falsy primitive values', () => {
		expect(classNames('a', '', null, undefined, false, 'b')).toBe('a b');
	});

	it('includes keys from object values when truthy', () => {
		expect(
			classNames('base', { active: true, disabled: false, focus: 1 }),
		).toBe('base active focus');
	});

	it('supports nested arrays and objects', () => {
		expect(
			classNames('root', ['x', null, ['y', { z: true, n: 0 }]]),
		).toBe('root x y z');
	});

	it('supports numbers and zero handling like classnames', () => {
		expect(classNames('n', 1, 0, { ok: true })).toBe('n 1 ok');
	});
});
