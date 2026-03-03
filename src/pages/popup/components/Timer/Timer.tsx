import {
	PauseIcon,
	PlayIcon,
	ResetIcon,
	SkipIcon,
} from '../../../../shared/components/Icons';
import {
	TIMER_RING_CIRCUMFERENCE,
	TIMER_RING_RADIUS,
} from '../../../../shared/constants';
import { TimerState } from '../../../../shared/types';
import {
	classNames,
	formatTimerClock,
	phaseDurationMs,
	useSynchronizedTimerDisplay,
} from '../../../../shared/utils';
import { usePopupContext } from '../../context';
import styles from './Timer.module.css';

function phaseColorVar(phase: TimerState['phase']): string {
	if (phase === 'work') return 'var(--primary)';
	if (phase === 'shortBreak') return 'var(--break)';
	return 'var(--break-long)';
}

export function Timer() {
	const { intl, pause, reset, resume, skip, start, state } = usePopupContext();
	const { settings, timer } = state;
	const displayMs = useSynchronizedTimerDisplay(timer, settings);

	const total = phaseDurationMs(timer.phase, settings);
	const progress = total > 0 ? Math.max(0, Math.min(1, displayMs / total)) : 1;
	const dashOffset = TIMER_RING_CIRCUMFERENCE * (1 - progress);
	const color = phaseColorVar(timer.phase);
	const isRunning = timer.status === 'running';
	const isPaused = timer.status === 'paused';
	const isIdle = timer.status === 'idle';

	return (
		<div className={styles.container}>
			<div className={styles.phaseLabel} style={{ color }}>
				{intl.timer.phases[timer.phase]}
			</div>

			<div className={styles.timerRing}>
				<svg
					className={classNames(styles.svg, {
						[styles.svgRunning]: isRunning,
					})}
					viewBox="0 0 200 200"
				>
					<circle
						cx="100"
						cy="100"
						r={TIMER_RING_RADIUS}
						fill="none"
						stroke="var(--border)"
						strokeWidth="8"
					/>
					<circle
						cx="100"
						cy="100"
						r={TIMER_RING_RADIUS}
						fill="none"
						stroke={color}
						strokeWidth="8"
						strokeLinecap="round"
						strokeDasharray={TIMER_RING_CIRCUMFERENCE}
						strokeDashoffset={dashOffset}
						className={styles.progressArc}
						style={{
							transform: 'rotate(-90deg)',
							transformOrigin: '100px 100px',
							transition: isRunning
								? 'stroke-dashoffset 0.5s linear'
								: 'stroke-dashoffset 0.3s ease',
							filter: isRunning ? `drop-shadow(0 0 6px ${color})` : 'none',
						}}
					/>
				</svg>

				<div className={styles.timerCenter}>
					<span className={styles.timeDisplay}>{formatTimerClock(displayMs)}</span>
					{isRunning && (
						<span className={styles.runningDot} style={{ background: color }} />
					)}
					{isPaused && (
						<span className={styles.pausedText}>{intl.timer.paused}</span>
					)}
				</div>
			</div>

			<div className={styles.cycleRow}>
				<div className={styles.cycleDots}>
					{Array.from({ length: settings.cycles }, (_, i) => {
						const done = i < timer.completedSessions;
						const active =
							i === timer.completedSessions &&
							timer.phase === 'work' &&
							!isIdle;
						return (
							<div
								key={i}
								className={classNames(styles.dot, {
									[styles.dotDone]: done,
									[styles.dotActive]: active,
								})}
								style={
									done || active
										? {
												background: color,
												boxShadow: done
													? 'none'
													: `0 0 6px ${color}`,
										  }
										: undefined
								}
							/>
						);
					})}
				</div>
				<span className={styles.cycleText}>
					{intl.sessionsProgress(timer.completedSessions, settings.cycles)}
				</span>
			</div>

			<div className={styles.controls}>
				{isIdle && (
					<button
						className={styles.primaryBtn}
						style={{ background: color }}
						onClick={start}
					>
						<PlayIcon />
						{intl.timer.startFocus}
					</button>
				)}

				{isRunning && (
					<button
						className={styles.primaryBtn}
						style={{ background: color }}
						onClick={pause}
					>
						<PauseIcon />
						{intl.timer.pause}
					</button>
				)}

				{isPaused && (
					<button
						className={styles.primaryBtn}
						style={{ background: color }}
						onClick={resume}
					>
						<PlayIcon />
						{intl.timer.resume}
					</button>
				)}

				{!isIdle && (
					<div className={styles.secondaryBtns}>
						<button
							className={styles.secondaryBtn}
							onClick={skip}
							title={intl.timer.skipTitle}
						>
							<SkipIcon />
							{intl.timer.skip}
						</button>
						<button
							className={styles.secondaryBtn}
							onClick={reset}
							title={intl.timer.resetTitle}
						>
							<ResetIcon />
							{intl.timer.reset}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
