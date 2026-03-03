import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react';
import {
	APP_STATE_STORAGE_KEY,
	AppLanguage,
	AppMessage,
	AppState,
	DEFAULT_STATE,
	getIntl,
	Settings,
	Tab,
	useChromeStorageState,
} from '../../../shared';
import { PopupContextValue } from './types';

const PopupContext = createContext<PopupContextValue | null>(null);

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

export function PopupProvider({ children }: { children: ReactNode }) {
	const {
		loading,
		setLocal,
		value: state,
	} = useChromeStorageState<AppState>(APP_STATE_STORAGE_KEY, DEFAULT_STATE, {
		hydrate: normalizeAppState,
	});
	const [activeTab, setActiveTab] = useState<Tab>('timer');

	useEffect(() => {
		chrome.runtime.sendMessage(
			{ type: 'GET_STATE' } as AppMessage,
			(response) => {
				if (response?.success && response.state) {
					setLocal(response.state);
				}
			},
		);
	}, [setLocal]);

	const send = (msg: AppMessage) => {
		chrome.runtime.sendMessage(msg, (response) => {
			if (response?.success && response.state) {
				setLocal(response.state);
			}
		});
	};

	const updateSettings = (settings: Partial<Settings>) => {
		send({ type: 'UPDATE_SETTINGS', settings });
	};

	const updateSites = (sites: string[]) => {
		send({ type: 'UPDATE_SITES', sites });
	};

	const start = () => send({ type: 'START' });
	const pause = () => send({ type: 'PAUSE' });
	const resume = () => send({ type: 'RESUME' });
	const reset = () => send({ type: 'RESET' });
	const skip = () => send({ type: 'SKIP' });

	const toggleTheme = () => {
		const nextTheme = state.settings.theme === 'light' ? 'dark' : 'light';
		updateSettings({ theme: nextTheme });
	};

	const setLanguage = (language: AppLanguage) => {
		updateSettings({ language });
	};

	const theme = state.settings.theme;
	const language = state.settings.language;
	const intl = getIntl(language);
	const isWorking =
		state.timer.status === 'running' && state.timer.phase === 'work';

	const getTabBadge = (tab: Tab): number | string | boolean =>
		tab === 'sites' &&
		state.blockedSites.length > 0 &&
		state.blockedSites.length;

	return (
		<PopupContext.Provider
			value={{
				state,
				loading,
				activeTab,
				setActiveTab,
				theme,
				language,
				intl,
				isWorking,
				getTabBadge,
				start,
				pause,
				resume,
				reset,
				skip,
				updateSites,
				updateSettings,
				toggleTheme,
				setLanguage,
			}}
		>
			{children}
		</PopupContext.Provider>
	);
}

export function usePopupContext(): PopupContextValue {
	const context = useContext(PopupContext);
	if (!context) {
		throw new Error('usePopupContext must be used within PopupProvider');
	}
	return context;
}
