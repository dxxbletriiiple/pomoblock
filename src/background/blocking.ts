import { BLOCKED_PAGE_EXTENSION_PATH } from '../shared/constants';

export function normalizeDomain(input: string): string {
	return input
		.toLowerCase()
		.trim()
		.replace(/^https?:\/\//, '')
		.split('/')[0]
		.split('?')[0]
		.replace(/^www\./, '');
}

export async function applyBlockingRules(
	sites: string[],
	active: boolean,
): Promise<void> {
	const existing = await chrome.declarativeNetRequest.getDynamicRules();
	const removeRuleIds = existing.map((r) => r.id);

	if (!active || sites.length === 0) {
		if (removeRuleIds.length > 0) {
			await chrome.declarativeNetRequest.updateDynamicRules({
				removeRuleIds,
			});
		}
		return;
	}

	const rules: chrome.declarativeNetRequest.Rule[] = [];
	sites.forEach((raw, idx) => {
		const domain = normalizeDomain(raw);
		if (!domain) return;

		const baseId = (idx + 1) * 2;
		rules.push({
			id: baseId - 1,
			priority: 1,
			action: {
				type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
				redirect: { extensionPath: BLOCKED_PAGE_EXTENSION_PATH },
			},
			condition: {
				urlFilter: `||${domain}^`,
				resourceTypes: [
					chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
				],
			},
		});
		rules.push({
			id: baseId,
			priority: 1,
			action: {
				type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
				redirect: { extensionPath: BLOCKED_PAGE_EXTENSION_PATH },
			},
			condition: {
				urlFilter: `||www.${domain}^`,
				resourceTypes: [
					chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
				],
			},
		});
	});

	await chrome.declarativeNetRequest.updateDynamicRules({
		removeRuleIds,
		addRules: rules,
	});
}
