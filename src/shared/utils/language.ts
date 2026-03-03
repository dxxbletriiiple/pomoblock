import { SUPPORTED_LANGUAGES } from '../intl';
import { AppLanguage } from '../types';

/**
 * Converts unknown language input to a supported app locale.
 * Falls back to English when value is invalid or unsupported.
 *
 * @param raw Unknown raw locale value, e.g. from browser APIs or storage.
 * @returns A supported application language code.
 */
export function normalizeLanguage(raw: unknown): AppLanguage {
	if (typeof raw !== 'string') return 'en';
	const base = raw.toLowerCase().split('-')[0];
	return SUPPORTED_LANGUAGES.includes(base as AppLanguage)
		? (base as AppLanguage)
		: 'en';
}
