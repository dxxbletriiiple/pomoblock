import { Dispatch, SetStateAction } from 'react';
import { AppLanguage, AppState, getIntl, Settings, Tab } from '../../../shared';

export interface PopupContextValue {
	state: AppState;
	loading: boolean;
	activeTab: Tab;
	setActiveTab: Dispatch<SetStateAction<Tab>>;
	theme: Settings['theme'];
	language: AppLanguage;
	intl: ReturnType<typeof getIntl>;
	isWorking: boolean;
	getTabBadge: (tab: Tab) => number | string | boolean;
	start: () => void;
	pause: () => void;
	resume: () => void;
	reset: () => void;
	skip: () => void;
	updateSites: (sites: string[]) => void;
	updateSettings: (settings: Partial<Settings>) => void;
	toggleTheme: () => void;
	setLanguage: (language: AppLanguage) => void;
}
