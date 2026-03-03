import { useEffect } from 'react';
import { classNames, formatTimerClock } from '../../shared/utils';
import { BlockedProvider, useBlockedContext } from './context';
import styles from './Blocked.module.css';

function BlockedContent() {
	const { displayMs, intl, language, state, theme } = useBlockedContext();

	useEffect(() => {
		document.documentElement.lang = language;
		document.title = `${intl.blocked.title} — PomoBlock`;
	}, [intl.blocked.title, language]);

	return (
		<div
			className={classNames(styles.page, {
				[styles.themeDark]: theme === 'dark',
				[styles.themeLight]: theme === 'light',
			})}
		>
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

export function BlockedPage() {
	return (
		<BlockedProvider>
			<BlockedContent />
		</BlockedProvider>
	);
}
