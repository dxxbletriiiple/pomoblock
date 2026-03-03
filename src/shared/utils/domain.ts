/**
 * Normalizes a domain-like string for blocklist checks.
 * Removes protocol, path, query, and leading `www.` prefix.
 *
 * @param input Raw user-provided URL or domain.
 * @returns Lowercased domain without protocol or path.
 */
export function normalizeDomain(input: string): string {
	return input
		.toLowerCase()
		.trim()
		.replace(/^https?:\/\//, '')
		.split('/')[0]
		.split('?')[0]
		.replace(/^www\./, '');
}

/**
 * Validates a domain using a conservative hostname pattern.
 *
 * @param domain Domain value to validate.
 * @returns `true` when the domain matches the expected hostname format.
 */
export function isValidDomain(domain: string): boolean {
	return /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/.test(
		domain,
	);
}
