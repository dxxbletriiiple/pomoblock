import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BLOCKED_PAGE_EXTENSION_PATH } from '../src/shared/constants';
import { applyBlockingRules, normalizeDomain } from '../src/background/blocking';

type DynamicRule = { id: number };

const getDynamicRules = vi.fn<() => Promise<DynamicRule[]>>();
const updateDynamicRules = vi.fn<
	(args: { removeRuleIds?: number[]; addRules?: unknown[] }) => Promise<void>
>();

function installChromeDnrMock() {
	(globalThis as unknown as { chrome: chrome }).chrome = {
		declarativeNetRequest: {
			getDynamicRules,
			updateDynamicRules,
			RuleActionType: {
				REDIRECT: 'redirect',
			},
			ResourceType: {
				MAIN_FRAME: 'main_frame',
			},
		},
	} as unknown as typeof chrome;
}

describe('normalizeDomain', () => {
	it('strips protocol, www, path and query', () => {
		expect(
			normalizeDomain(' https://www.Example.com/some/path?x=1 '),
		).toBe('example.com');
	});

	it('keeps bare domains unchanged except lowercasing', () => {
		expect(normalizeDomain('Sub.Domain.COM')).toBe('sub.domain.com');
	});

	it('returns empty string for invalid protocol-only input', () => {
		expect(normalizeDomain('https://')).toBe('');
	});
});

describe('applyBlockingRules', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		getDynamicRules.mockResolvedValue([]);
		updateDynamicRules.mockResolvedValue(undefined);
		installChromeDnrMock();
	});

	it('removes existing rules when blocking is inactive', async () => {
		getDynamicRules.mockResolvedValue([{ id: 1 }, { id: 2 }]);

		await applyBlockingRules(['example.com'], false);

		expect(updateDynamicRules).toHaveBeenCalledTimes(1);
		expect(updateDynamicRules).toHaveBeenCalledWith({
			removeRuleIds: [1, 2],
		});
	});

	it('does nothing when there are no sites and no existing rules', async () => {
		await applyBlockingRules([], true);

		expect(updateDynamicRules).not.toHaveBeenCalled();
	});

	it('adds redirect rules for normalized domains and skips empty entries', async () => {
		getDynamicRules.mockResolvedValue([{ id: 9 }]);

		await applyBlockingRules(
			[' https://www.Example.com/path?q=1 ', 'https://'],
			true,
		);

		expect(updateDynamicRules).toHaveBeenCalledTimes(1);
		const payload = updateDynamicRules.mock.calls[0][0];
		expect(payload.removeRuleIds).toEqual([9]);
		expect(payload.addRules).toHaveLength(2);

		const addRules = payload.addRules as Array<{
			id: number;
			action: { redirect?: { extensionPath?: string } };
			condition: { urlFilter: string };
		}>;

		expect(addRules.map((rule) => rule.id)).toEqual([1, 2]);
		expect(addRules.map((rule) => rule.condition.urlFilter)).toEqual([
			'||example.com^',
			'||www.example.com^',
		]);
		expect(
			addRules.every(
				(rule) =>
					rule.action.redirect?.extensionPath ===
					BLOCKED_PAGE_EXTENSION_PATH,
			),
		).toBe(true);
	});
});
