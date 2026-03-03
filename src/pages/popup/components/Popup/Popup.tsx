import { useCallback, useEffect, useState } from 'react';
import {
	APP_STATE_STORAGE_KEY,
	AppLanguage,
	AppMessage,
	AppState,
	classNames,
	DEFAULT_STATE,
	getIntl,
	Settings,
	SUPPORTED_LANGUAGES,
	Tab,
	TabComponent,
	TABS,
} from '../../../../shared';
import {
	LanguageIcon,
	MoonIcon,
	SunIcon,
} from '../../../../shared/components/Icons';
import { SettingsPanel } from '../SettingsPanel/SettingsPanel';
import { SiteList } from '../SiteList';
import { Timer } from '../Timer';
import styles from './Popup.module.css';

export const Popup = () => {
	const [state, setState] = useState<AppState>(DEFAULT_STATE);
	const [activeTab, setActiveTab] = useState<Tab>('timer');
	const [loading, setLoading] = useState(true);

	// Load state from background on mount
	useEffect(() => {
		chrome.runtime.sendMessage(
			{ type: 'GET_STATE' } as AppMessage,
			(response) => {
				if (chrome.runtime.lastError) {
					// Background may not be ready yet — read storage directly
					chrome.storage.local.get(APP_STATE_STORAGE_KEY, (data) => {
						if (data[APP_STATE_STORAGE_KEY]) {
							setState(data[APP_STATE_STORAGE_KEY] as AppState);
						}
						setLoading(false);
					});
					return;
				}
				if (response?.success && response.state)
					setState(response.state);
				setLoading(false);
			},
		);
	}, []);

	// Keep in sync when background updates storage
	useEffect(() => {
		const listener = (changes: {
			[key: string]: chrome.storage.StorageChange;
		}) => {
			if (changes[APP_STATE_STORAGE_KEY]?.newValue) {
				setState(changes[APP_STATE_STORAGE_KEY].newValue as AppState);
			}
		};
		chrome.storage.onChanged.addListener(listener);
		return () => chrome.storage.onChanged.removeListener(listener);
	}, []);

	const send = useCallback((msg: AppMessage) => {
		chrome.runtime.sendMessage(msg, (response) => {
			if (response?.success && response.state) setState(response.state);
		});
	}, []);

	const handleThemeToggle = () => {
		const next = state.settings.theme === 'light' ? 'dark' : 'light';
		send({ type: 'UPDATE_SETTINGS', settings: { theme: next } });
	};
	const handleLanguageChange = (language: AppLanguage) => {
		send({ type: 'UPDATE_SETTINGS', settings: { language } });
	};

	const theme = state.settings.theme;
	const language = state.settings.language;
	const intl = getIntl(language);
	const isWorking =
		state.timer.status === 'running' && state.timer.phase === 'work';
	const hasTabBadge = (tab: Tab): number | string | boolean =>
		tab === 'sites' &&
		state.blockedSites.length > 0 &&
		state.blockedSites.length;

	return (
		<div className={classNames(styles.root, styles[theme])}>
			{/* Header */}
			<header className={styles.header}>
				<div className={styles.logo}>
					<span className={styles.logoIcon}>🍅</span>
					<span className={styles.logoText}>PomoBlock</span>
					{isWorking && (
						<span className={styles.activePill}>
							{intl.header.focusPill}
						</span>
					)}
				</div>
				<div className={styles.headerActions}>
					<label
						className={styles.languagePicker}
						title={intl.header.languageSelectTitle}
					>
						<span className={styles.languageIcon}>
							<LanguageIcon />
						</span>
						<select
							className={styles.languageSelect}
							value={language}
							aria-label={intl.header.languageSelectTitle}
							onChange={(e) =>
								handleLanguageChange(
									e.target.value as AppLanguage,
								)
							}
						>
							{SUPPORTED_LANGUAGES.map((code) => (
								<option key={code} value={code}>
									{intl.languageName(code)}
								</option>
							))}
						</select>
					</label>
					<button
						className={styles.themeBtn}
						onClick={handleThemeToggle}
						title={intl.header.themeToggleTitle}
					>
						{theme === 'dark' ? <SunIcon /> : <MoonIcon />}
					</button>
				</div>
			</header>

			{/* Tabs */}
			<nav className={styles.tabs}>
				{TABS.map((tab) => (
					<TabComponent
						key={tab}
						onClick={() => setActiveTab(tab)}
						isActive={activeTab === tab}
						badge={hasTabBadge(tab)}
					>
						{intl.tabs[tab]}
					</TabComponent>
				))}
			</nav>

			{/* Content */}
			<main className={styles.content}>
				{loading ? (
					<div className={styles.loader}>
						<div className={styles.spinner} />
					</div>
				) : (
					<>
						{activeTab === 'timer' && (
							<Timer
								timer={state.timer}
								settings={state.settings}
								onStart={() => send({ type: 'START' })}
								onPause={() => send({ type: 'PAUSE' })}
								onResume={() => send({ type: 'RESUME' })}
								onReset={() => send({ type: 'RESET' })}
								onSkip={() => send({ type: 'SKIP' })}
							/>
						)}
						{activeTab === 'sites' && (
							<SiteList
								sites={state.blockedSites}
								language={language}
								isBlocking={isWorking}
								onChange={(sites) =>
									send({ type: 'UPDATE_SITES', sites })
								}
							/>
						)}
						{activeTab === 'settings' && (
							<SettingsPanel
								settings={state.settings}
								timerStatus={state.timer.status}
								onChange={(s: Partial<Settings>) =>
									send({
										type: 'UPDATE_SETTINGS',
										settings: s,
									})
								}
							/>
						)}
					</>
				)}
			</main>
		</div>
	);
};
