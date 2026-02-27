export function normalizeDomain(input: string): string {
	return input
		.toLowerCase()
		.trim()
		.replace(/^https?:\/\//, '')
		.split('/')[0]
		.split('?')[0]
		.replace(/^www\./, '');
}

export function isValidDomain(domain: string): boolean {
	return /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/.test(
		domain,
	);
}
