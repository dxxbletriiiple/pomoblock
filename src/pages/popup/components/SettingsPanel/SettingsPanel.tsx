import React from 'react';
import {
	CYCLES,
	LONG_BREAKS,
	SHORT_BREAKS,
	WORK_TIMES,
} from '../../../../shared/constants';
import { Settings, TimerStatus } from '../../../../shared/types';
import {
	CycleIcon,
	LongBreakIcon,
	ShortBreakIcon,
	WarningIcon,
	WorkIcon,
} from '../Icons';
import styles from './SettingsPanel.module.css';
import { SelectFieldProps } from './types';

interface Props {
	settings: Settings;
	timerStatus: TimerStatus;
	onChange: (patch: Partial<Settings>) => void;
}

function SelectField({
	label,
	description,
	icon,
	value,
	options,
	unit,
	disabled,
	color,
	onChange,
}: SelectFieldProps) {
	return (
		<div
			className={`${styles.field} ${disabled ? styles.fieldDisabled : ''}`}
		>
			<div className={styles.fieldLeft}>
				<div
					className={styles.fieldIcon}
					style={
						color ? { background: `${color}20`, color } : undefined
					}
				>
					{icon}
				</div>
				<div className={styles.fieldInfo}>
					<span className={styles.fieldLabel}>{label}</span>
					<span className={styles.fieldDesc}>{description}</span>
				</div>
			</div>
			<select
				className={styles.select}
				value={value}
				disabled={disabled}
				onChange={(e) => onChange(Number(e.target.value))}
			>
				{options.map((opt) => (
					<option key={opt} value={opt}>
						{opt} {unit}
					</option>
				))}
			</select>
		</div>
	);
}

export function SettingsPanel({ settings, timerStatus, onChange }: Props) {
	const isActive = timerStatus !== 'idle';

	return (
		<div className={styles.container}>
			{isActive && (
				<div className={styles.warningBanner}>
					<WarningIcon />
					Settings are locked while timer is running. Reset to make
					changes.
				</div>
			)}

			{/* Work time */}
			<div className={styles.group}>
				<h3 className={styles.groupTitle}>Focus Time</h3>
				<SelectField
					label="Work Duration"
					description="Length of each focus session"
					icon={<WorkIcon />}
					value={settings.workTime}
					options={WORK_TIMES}
					unit="min"
					disabled={isActive}
					color="var(--primary)"
					onChange={(v) => onChange({ workTime: v })}
				/>
			</div>

			{/* Breaks */}
			<div className={styles.group}>
				<h3 className={styles.groupTitle}>Breaks</h3>
				<SelectField
					label="Short Break"
					description="Rest after each focus session"
					icon={<ShortBreakIcon />}
					value={settings.shortBreak}
					options={SHORT_BREAKS}
					unit="min"
					disabled={isActive}
					color="var(--break)"
					onChange={(v) => onChange({ shortBreak: v })}
				/>
				<SelectField
					label="Long Break"
					description="Rest after completing all cycles"
					icon={<LongBreakIcon />}
					value={settings.longBreak}
					options={LONG_BREAKS}
					unit="min"
					disabled={isActive}
					color="var(--break-long)"
					onChange={(v) => onChange({ longBreak: v })}
				/>
			</div>

			{/* Cycles */}
			<div className={styles.group}>
				<h3 className={styles.groupTitle}>Cycles</h3>
				<SelectField
					label="Sessions per Set"
					description="Focus sessions before a long break"
					icon={<CycleIcon />}
					value={settings.cycles}
					options={CYCLES}
					unit="sessions"
					disabled={isActive}
					onChange={(v) => onChange({ cycles: v })}
				/>

				{/* Visual cycle preview */}
				<div className={styles.cyclePreview}>
					{Array.from({ length: settings.cycles }, (_, i) => (
						<React.Fragment key={i}>
							<div className={styles.previewWork}>
								<span>🎯</span>
								<span className={styles.previewLabel}>
									Work
								</span>
							</div>
							{i < settings.cycles - 1 ? (
								<div className={styles.previewBreak}>
									<span>☕</span>
									<span className={styles.previewLabel}>
										Short
									</span>
								</div>
							) : (
								<div className={styles.previewLongBreak}>
									<span>🌿</span>
									<span className={styles.previewLabel}>
										Long
									</span>
								</div>
							)}
							{i < settings.cycles - 1 && (
								<div className={styles.previewArrow}>→</div>
							)}
						</React.Fragment>
					))}
				</div>

				<div className={styles.cycleSummary}>
					<div className={styles.summaryItem}>
						<span
							className={styles.summaryValue}
							style={{ color: 'var(--primary)' }}
						>
							{settings.workTime}m
						</span>
						<span className={styles.summaryLabel}>
							× {settings.cycles} focus
						</span>
					</div>
					<span className={styles.summarySep}>+</span>
					<div className={styles.summaryItem}>
						<span
							className={styles.summaryValue}
							style={{ color: 'var(--break)' }}
						>
							{settings.shortBreak}m
						</span>
						<span className={styles.summaryLabel}>
							× {settings.cycles - 1} short
						</span>
					</div>
					<span className={styles.summarySep}>+</span>
					<div className={styles.summaryItem}>
						<span
							className={styles.summaryValue}
							style={{ color: 'var(--break-long)' }}
						>
							{settings.longBreak}m
						</span>
						<span className={styles.summaryLabel}>long break</span>
					</div>
					<span className={styles.summarySep}>=</span>
					<div className={styles.summaryItem}>
						<span className={styles.summaryValue}>
							{settings.workTime * settings.cycles +
								settings.shortBreak * (settings.cycles - 1) +
								settings.longBreak}
							m
						</span>
						<span className={styles.summaryLabel}>total</span>
					</div>
				</div>
			</div>
		</div>
	);
}
