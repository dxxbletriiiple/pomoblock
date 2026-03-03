import {
	SetStateAction,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react';

type StorageAreaName = 'local' | 'sync' | 'session';

interface UseChromeStorageStateOptions<T> {
	area?: StorageAreaName;
	hydrate?: (raw: unknown, fallbackValue: T) => T;
}

/**
 * React state backed by a chrome.storage key.
 * Automatically hydrates on mount and syncs updates from other extension contexts.
 *
 * @param key Storage key.
 * @param initialValue Fallback state before hydration.
 * @param options Hook options.
 * @returns State value, loading flag, and helper actions.
 */
export function useChromeStorageState<T>(
	key: string,
	initialValue: T,
	options: UseChromeStorageStateOptions<T> = {},
) {
	const areaName = options.area ?? 'local';
	const hydrate =
		options.hydrate ??
		((raw: unknown, fallbackValue: T): T =>
			raw === undefined ? fallbackValue : (raw as T));

	const [value, setValue] = useState<T>(initialValue);
	const [loading, setLoading] = useState(true);
	const valueRef = useRef(value);

	useEffect(() => {
		valueRef.current = value;
	}, [value]);

	const read = useCallback(async () => {
		const storageArea = chrome.storage[areaName];
		const data = await storageArea.get(key);
		const next = hydrate(data[key], initialValue);
		valueRef.current = next;
		setValue(next);
		return next;
	}, [areaName, hydrate, initialValue, key]);

	useEffect(() => {
		let mounted = true;

		read()
			.catch(() => undefined)
			.finally(() => {
				if (mounted) setLoading(false);
			});

		const listener = (
			changes: { [key: string]: chrome.storage.StorageChange },
			changedArea: string,
		) => {
			if (changedArea !== areaName) return;
			if (!changes[key]) return;
			const next = hydrate(changes[key].newValue, initialValue);
			valueRef.current = next;
			setValue(next);
		};

		chrome.storage.onChanged.addListener(listener);
		return () => {
			mounted = false;
			chrome.storage.onChanged.removeListener(listener);
		};
	}, [areaName, hydrate, initialValue, key, read]);

	/**
	 * Updates local React state and persists it into chrome.storage.
	 */
	const setAndPersist = useCallback(
		async (nextState: SetStateAction<T>) => {
			const prev = valueRef.current;
			const next =
				typeof nextState === 'function'
					? (nextState as (prevState: T) => T)(prev)
					: nextState;

			valueRef.current = next;
			setValue(next);
			await chrome.storage[areaName].set({ [key]: next });
			return next;
		},
		[areaName, key],
	);

	/**
	 * Updates only local React state without writing to storage.
	 * Useful when storage is already updated by background logic.
	 */
	const setLocal = useCallback((nextState: SetStateAction<T>) => {
		const prev = valueRef.current;
		const next =
			typeof nextState === 'function'
				? (nextState as (prevState: T) => T)(prev)
				: nextState;

		valueRef.current = next;
		setValue(next);
		return next;
	}, []);

	return {
		value,
		loading,
		reload: read,
		setLocal,
		setValue: setAndPersist,
	};
}
