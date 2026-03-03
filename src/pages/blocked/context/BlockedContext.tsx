import {
	createContext,
	ReactNode,
	useContext,
} from 'react';
import {
	APP_STATE_STORAGE_KEY,
	AppLanguage,
	AppState,
	DEFAULT_STATE,
	getIntl,
	Settings,
	useChromeStorageState,
	useSynchronizedTimerDisplay,
} from '../../../shared';
import { normalizeLanguage } from '../../../shared/utils';

interface BlockedContextValue {
	state: AppState;
	loading: boolean;
	displayMs: number;
	theme: Settings['theme'];
	language: AppLanguage;
	intl: ReturnType<typeof getIntl>;
}

const BlockedContext = createContext<BlockedContextValue | null>(null);

function normalizeAppState(raw: unknown, fallbackValue: AppState): AppState {
	if (!raw || typeof raw !== 'object') return fallbackValue;
	const parsed = raw as Partial<AppState>;
	return {
		settings: {
			...fallbackValue.settings,
			...(parsed.settings ?? {}),
		},
		blockedSites: parsed.blockedSites ?? fallbackValue.blockedSites,
		timer: {
			...fallbackValue.timer,
			...(parsed.timer ?? {}),
		},
	};
}

export function BlockedProvider({ children }: { children: ReactNode }) {
	const { loading, value: state } = useChromeStorageState<AppState>(
		APP_STATE_STORAGE_KEY,
		DEFAULT_STATE,
		{ hydrate: normalizeAppState },
	);
	const displayMs = useSynchronizedTimerDisplay(state.timer, state.settings);

	const theme = state.settings.theme;
	const language = normalizeLanguage(state.settings.language);
	const intl = getIntl(language);

	return (
		<BlockedContext.Provider
			value={{
				state,
				loading,
				displayMs,
				theme,
				language,
				intl,
			}}
		>
			{children}
		</BlockedContext.Provider>
	);
}

export function useBlockedContext(): BlockedContextValue {
	const context = useContext(BlockedContext);
	if (!context) {
		throw new Error('useBlockedContext must be used within BlockedProvider');
	}
	return context;
}
