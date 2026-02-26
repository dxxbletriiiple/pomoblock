import { useEffect, useState } from 'react';
import {
	MS_PER_MINUTE,
	TIMER_RING_CIRCUMFERENCE,
	TIMER_RING_RADIUS,
	TIMER_TICK_INTERVAL_MS,
} from '../../../shared/constants/constants';
import { Settings, TimerState } from '../../../shared/types/types';
import { PauseIcon, PlayIcon, ResetIcon, SkipIcon } from '../Icons';
import styles from './Timer.module.css';
import { TimerProps } from './types';

function phaseDurationMs(phase: TimerState['phase'], s: Settings): number {
	if (phase === 'work') return s.workTime * MS_PER_MINUTE;
	if (phase === 'shortBreak') return s.shortBreak * MS_PER_MINUTE;
	return s.longBreak * MS_PER_MINUTE;
}

function formatTime(ms: number): string {
	const total = Math.max(0, Math.ceil(ms / 1000));
	const m = Math.floor(total / 60);
	const s = total % 60;
	return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function phaseLabel(phase: TimerState['phase']): string {
	if (phase === 'work') return 'Focus Session';
	if (phase === 'shortBreak') return 'Short Break';
	return 'Long Break';
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
				{phaseLabel(timer.phase)}
			</div>

			{/* Timer ring */}
			<div className={styles.timerRing}>
				<svg
					className={`${styles.svg} ${isRunning ? styles.svgRunning : ''}`}
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
						{formatTime(displayMs)}
					</span>
					{isRunning && (
						<span
							className={styles.runningDot}
							style={{ background: color }}
						/>
					)}
					{isPaused && (
						<span className={styles.pausedText}>paused</span>
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
								className={`${styles.dot} ${done ? styles.dotDone : ''} ${active ? styles.dotActive : ''}`}
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
					{timer.completedSessions}/{settings.cycles} sessions
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
						Start Focus
					</button>
				)}

				{isRunning && (
					<button
						className={styles.primaryBtn}
						style={{ background: color }}
						onClick={onPause}
					>
						<PauseIcon />
						Pause
					</button>
				)}

				{isPaused && (
					<button
						className={styles.primaryBtn}
						style={{ background: color }}
						onClick={onResume}
					>
						<PlayIcon />
						Resume
					</button>
				)}

				{!isIdle && (
					<div className={styles.secondaryBtns}>
						<button
							className={styles.secondaryBtn}
							onClick={onSkip}
							title="Skip to next phase"
						>
							<SkipIcon />
							Skip
						</button>
						<button
							className={styles.secondaryBtn}
							onClick={onReset}
							title="Reset timer"
						>
							<ResetIcon />
							Reset
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
