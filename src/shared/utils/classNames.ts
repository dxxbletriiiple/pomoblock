type ClassDictionary = Record<string, unknown>;
type ClassArray = ClassValue[];
type ClassPrimitive = string | number | null | undefined | false;
export type ClassValue = ClassPrimitive | ClassDictionary | ClassArray;

/**
 * Recursively flattens class values into a single list of CSS class names.
 *
 * @param result Accumulator for collected class names.
 * @param value Input value that may contain classes in primitive, array, or object form.
 */
function append(result: string[], value: ClassValue): void {
	if (!value) return;

	if (typeof value === 'string' || typeof value === 'number') {
		result.push(String(value));
		return;
	}

	if (Array.isArray(value)) {
		for (const entry of value) {
			append(result, entry);
		}
		return;
	}

	if (typeof value === 'object') {
		for (const [key, enabled] of Object.entries(value)) {
			if (enabled) result.push(key);
		}
	}
}

/**
 * Builds a space-separated class name string from mixed input values.
 * Supports strings, numbers, arrays, and object maps `{ className: boolean }`.
 *
 * @param values Class values to combine.
 * @returns A normalized class name string.
 */
export function classNames(...values: ClassValue[]): string {
	const result: string[] = [];
	for (const value of values) {
		append(result, value);
	}
	return result.join(' ');
}
