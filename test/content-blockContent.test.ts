import { beforeEach, describe, expect, it } from 'vitest';
import { showBlockedOverlay } from '../src/content/blockContent';

describe('showBlockedOverlay', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	it('creates an overlay with the default message', () => {
		showBlockedOverlay();

		const overlay = document.getElementById('pomoblock-overlay');
		expect(overlay).not.toBeNull();
		expect(overlay?.textContent).toBe('Blocked by PomoBlock');
	});

	it('uses a custom message when provided', () => {
		showBlockedOverlay('Focus mode is active');

		const overlay = document.getElementById('pomoblock-overlay');
		expect(overlay?.textContent).toBe('Focus mode is active');
	});

	it('does not create duplicate overlays when called multiple times', () => {
		showBlockedOverlay('first');
		showBlockedOverlay('second');

		expect(document.querySelectorAll('#pomoblock-overlay')).toHaveLength(1);
		expect(document.getElementById('pomoblock-overlay')?.textContent).toBe(
			'first',
		);
	});
});
