import { useEffect, useState } from 'react';
import { APP_STATE_STORAGE_KEY, DEFAULT_STATE } from '../../shared/constants';
import { getIntl, SUPPORTED_LANGUAGES } from '../../shared/intl';
import type { AppLanguage, AppState, Settings, TimerState } from '../../shared/types';
import { formatTimerClock, minutesToMs } from '../../shared/utils';
import styles from './Blocked.module.css';

function normalizeLanguage(raw: unknown): AppLanguage {
	if (typeof raw !== 'string') return 'en';
	const base = raw.toLowerCase().split('-')[0];
	return SUPPORTED_LANGUAGES.includes(base as AppLanguage)
		? (base as AppLanguage)
		: 'en';
}

function parseState(value: unknown): AppState {
	if (!value || typeof value !== 'object') return DEFAULT_STATE;
	const parsed = value as Partial<AppState>;
	return {
		settings: {
			...DEFAULT_STATE.settings,
			...(parsed.settings ?? {}),
		},
		blockedSites: parsed.blockedSites ?? [],
		timer: {
			...DEFAULT_STATE.timer,
			...(parsed.timer ?? {}),
		},
	};
}

function phaseDurationMs(phase: TimerState['phase'], settings: Settings): number {
	if (phase === 'work') return minutesToMs(settings.workTime);
	if (phase === 'shortBreak') return minutesToMs(settings.shortBreak);
	return minutesToMs(settings.longBreak);
}

export function BlockedPage() {
	const [state, setState] = useState<AppState>(DEFAULT_STATE);
	const [displayMs, setDisplayMs] = useState(
		phaseDurationMs(DEFAULT_STATE.timer.phase, DEFAULT_STATE.settings),
	);

	useEffect(() => {
		chrome.storage.local.get(APP_STATE_STORAGE_KEY, (data) => {
			setState(parseState(data[APP_STATE_STORAGE_KEY]));
		});

		const listener = (changes: {
			[key: string]: chrome.storage.StorageChange;
		}) => {
			if (changes[APP_STATE_STORAGE_KEY]?.newValue) {
				setState(parseState(changes[APP_STATE_STORAGE_KEY].newValue));
			}
		};
		chrome.storage.onChanged.addListener(listener);
		return () => chrome.storage.onChanged.removeListener(listener);
	}, []);

	useEffect(() => {
		const compute = () => {
			const { timer, settings } = state;
			if (timer.status === 'running' && timer.endTime != null) {
				setDisplayMs(Math.max(0, timer.endTime - Date.now()));
			} else if (timer.status === 'paused' && timer.remainingMs != null) {
				setDisplayMs(timer.remainingMs);
			} else {
				setDisplayMs(phaseDurationMs(timer.phase, settings));
			}
		};

		compute();
		if (state.timer.status !== 'running') return;
		const id = setInterval(compute, 500);
		return () => clearInterval(id);
	}, [state]);

	const language = normalizeLanguage(state.settings.language);
	const intl = getIntl(language);

	useEffect(() => {
		document.documentElement.lang = language;
		document.title = `Site Blocked — PomoBlock`;
	}, [language]);

	return (
		<div className={styles.page}>
			<div className={styles.card}>
				<span className={styles.tomato}>🍅</span>
				<h1>{intl.blocked.title}</h1>
				<p className={styles.subtitle}>{intl.blocked.subtitle}</p>

				<div className={styles.timerDisplay}>
					<div className={styles.timerLabel}>
						{intl.blocked.timerLabel}
					</div>
					<div className={styles.timerValue}>
						{formatTimerClock(displayMs)}
					</div>
					<div className={styles.phaseBadge}>
						{intl.timer.phases[state.timer.phase]}
					</div>
				</div>

				<p className={styles.message}>
					{intl.blocked.messageLine1}
					<br />
					{intl.blocked.messageLine2}
				</p>

				<button
					className={styles.backBtn}
					onClick={() => history.back()}
				>
					{intl.blocked.backButton}
				</button>

				<div className={styles.branding}>
					<span>🍅</span>
					<span>PomoBlock</span>
				</div>
			</div>
		</div>
	);
}
