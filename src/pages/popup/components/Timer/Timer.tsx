import { useEffect, useState } from 'react';
import {
	PauseIcon,
	PlayIcon,
	ResetIcon,
	SkipIcon,
} from '../../../../shared/components/Icons';
import {
	TIMER_RING_CIRCUMFERENCE,
	TIMER_RING_RADIUS,
	TIMER_TICK_INTERVAL_MS,
} from '../../../../shared/constants';
import { getIntl } from '../../../../shared/intl';
import { Settings, TimerState } from '../../../../shared/types';
import {
	classNames,
	formatTimerClock,
	minutesToMs,
} from '../../../../shared/utils';
import styles from './Timer.module.css';
import { TimerProps } from './types';

function phaseDurationMs(phase: TimerState['phase'], s: Settings): number {
	if (phase === 'work') return minutesToMs(s.workTime);
	if (phase === 'shortBreak') return minutesToMs(s.shortBreak);
	return minutesToMs(s.longBreak);
}

function phaseColorVar(phase: TimerState['phase']): string {
	if (phase === 'work') return 'var(--primary)';
	if (phase === 'shortBreak') return 'var(--break)';
	return 'var(--break-long)';
}

export function Timer({
	timer,
	settings,
	onStart,
	onPause,
	onResume,
	onReset,
	onSkip,
}: TimerProps) {
	const [displayMs, setDisplayMs] = useState(0);
	const intl = getIntl(settings.language);

	useEffect(() => {
		const compute = () => {
			if (timer.status === 'running' && timer.endTime != null) {
				setDisplayMs(Math.max(0, timer.endTime - Date.now()));
			} else if (timer.status === 'paused' && timer.remainingMs != null) {
				setDisplayMs(timer.remainingMs);
			} else {
				setDisplayMs(phaseDurationMs(timer.phase, settings));
			}
		};

		compute();
		if (timer.status !== 'running') return;
		const id = setInterval(compute, TIMER_TICK_INTERVAL_MS);
		return () => clearInterval(id);
	}, [timer, settings]);

	const total = phaseDurationMs(timer.phase, settings);
	const progress =
		total > 0 ? Math.max(0, Math.min(1, displayMs / total)) : 1;
	const dashOffset = TIMER_RING_CIRCUMFERENCE * (1 - progress);
	const color = phaseColorVar(timer.phase);
	const isRunning = timer.status === 'running';
	const isPaused = timer.status === 'paused';
	const isIdle = timer.status === 'idle';

	return (
		<div className={styles.container}>
			{/* Phase label */}
			<div className={styles.phaseLabel} style={{ color }}>
				{intl.timer.phases[timer.phase]}
			</div>

			{/* Timer ring */}
			<div className={styles.timerRing}>
				<svg
					className={classNames(styles.svg, {
						[styles.svgRunning]: isRunning,
					})}
					viewBox="0 0 200 200"
				>
					{/* Track */}
					<circle
						cx="100"
						cy="100"
						r={TIMER_RING_RADIUS}
						fill="none"
						stroke="var(--border)"
						strokeWidth="8"
					/>
					{/* Progress */}
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
							filter: isRunning
								? `drop-shadow(0 0 6px ${color})`
								: 'none',
						}}
					/>
				</svg>

				{/* Center content */}
				<div className={styles.timerCenter}>
					<span className={styles.timeDisplay}>
						{formatTimerClock(displayMs)}
					</span>
					{isRunning && (
						<span
							className={styles.runningDot}
							style={{ background: color }}
						/>
					)}
					{isPaused && (
						<span className={styles.pausedText}>
							{intl.timer.paused}
						</span>
					)}
				</div>
			</div>

			{/* Cycle dots */}
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
					{intl.sessionsProgress(
						timer.completedSessions,
						settings.cycles,
					)}
				</span>
			</div>

			{/* Controls */}
			<div className={styles.controls}>
				{isIdle && (
					<button
						className={styles.primaryBtn}
						style={{ background: color }}
						onClick={onStart}
					>
						<PlayIcon />
						{intl.timer.startFocus}
					</button>
				)}

				{isRunning && (
					<button
						className={styles.primaryBtn}
						style={{ background: color }}
						onClick={onPause}
					>
						<PauseIcon />
						{intl.timer.pause}
					</button>
				)}

				{isPaused && (
					<button
						className={styles.primaryBtn}
						style={{ background: color }}
						onClick={onResume}
					>
						<PlayIcon />
						{intl.timer.resume}
					</button>
				)}

				{!isIdle && (
					<div className={styles.secondaryBtns}>
						<button
							className={styles.secondaryBtn}
							onClick={onSkip}
							title={intl.timer.skipTitle}
						>
							<SkipIcon />
							{intl.timer.skip}
						</button>
						<button
							className={styles.secondaryBtn}
							onClick={onReset}
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
