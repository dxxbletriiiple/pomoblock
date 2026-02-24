import { useCallback, useEffect, useState } from 'react';
import { AppMessage, AppState, DEFAULT_STATE, Settings } from '../shared/types';
import styles from './App.module.css';
import { SettingsPanel } from './components/SettingsPanel/SettingsPanel';
import { SiteList } from './components/SiteList/SiteList';
import { Timer } from './components/Timer/Timer';

type Tab = 'timer' | 'sites' | 'settings';

export default function App() {
	const [state, setState] = useState<AppState>(DEFAULT_STATE);
	const [activeTab, setActiveTab] = useState<Tab>('timer');
	const [loading] = useState(true);

	// Load state from background on mount
	useEffect(() => {
		chrome.runtime.sendMessage(
			{ type: 'GET_STATE' } as AppMessage,
			(response) => {
				if (chrome.runtime.lastError) {
					// Background may not be ready yet — read storage directly
					chrome.storage.local.get('appState', (data) => {
						if (data.appState) setState(data.appState);
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
			if (changes.appState?.newValue) {
				setState(changes.appState.newValue as AppState);
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

	const theme = state.settings.theme;
	const isWorking =
		state.timer.status === 'running' && state.timer.phase === 'work';

	return (
		<div
			className={`${styles.root} ${theme === 'dark' ? styles.dark : styles.light}`}
		>
			{/* Header */}
			<header className={styles.header}>
				<div className={styles.logo}>
					<span className={styles.logoIcon}>🍅</span>
					<span className={styles.logoText}>PomoBlock</span>
					{isWorking && (
						<span className={styles.activePill}>FOCUS</span>
					)}
				</div>
				<button
					className={styles.themeBtn}
					onClick={handleThemeToggle}
					title="Toggle theme"
				>
					{theme === 'dark' ? (
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<circle cx="12" cy="12" r="5" />
							<line x1="12" y1="1" x2="12" y2="3" />
							<line x1="12" y1="21" x2="12" y2="23" />
							<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
							<line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
							<line x1="1" y1="12" x2="3" y2="12" />
							<line x1="21" y1="12" x2="23" y2="12" />
							<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
							<line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
						</svg>
					) : (
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
						</svg>
					)}
				</button>
			</header>

			{/* Tabs */}
			<nav className={styles.tabs}>
				{(['timer', 'sites', 'settings'] as Tab[]).map((tab) => (
					<button
						key={tab}
						className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
						onClick={() => setActiveTab(tab)}
					>
						{tab === 'timer' && 'Timer'}
						{tab === 'sites' && (
							<>
								Sites
								{state.blockedSites.length > 0 && (
									<span className={styles.badge}>
										{state.blockedSites.length}
									</span>
								)}
							</>
						)}
						{tab === 'settings' && 'Settings'}
					</button>
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
}
