import React from 'react';
import {
	CycleIcon,
	LongBreakIcon,
	ShortBreakIcon,
	WarningIcon,
	WorkIcon,
} from '../../../../shared/components/Icons';
import {
	BUG_REPORT_URL,
	CYCLES,
	LONG_BREAKS,
	SHORT_BREAKS,
	WORK_TIMES,
} from '../../../../shared/constants';
import { classNames } from '../../../../shared/utils';
import { usePopupContext } from '../../context';
import styles from './SettingsPanel.module.css';
import { SelectFieldProps } from './types';

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
			className={classNames(styles.field, {
				[styles.fieldDisabled]: disabled,
			})}
		>
			<div className={styles.fieldLeft}>
				<div
					className={styles.fieldIcon}
					style={color ? { background: `${color}20`, color } : undefined}
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

export function SettingsPanel() {
	const { intl, state, updateSettings } = usePopupContext();
	const { settings, timer } = state;
	const isActive = timer.status !== 'idle';
	const totalMinutes =
		settings.workTime * settings.cycles +
		settings.shortBreak * (settings.cycles - 1) +
		settings.longBreak;
	const totalHours = Math.floor(totalMinutes / 60);
	const totalMinutesRemainder = totalMinutes % 60;

	return (
		<div className={styles.container}>
			{isActive && (
				<div className={styles.warningBanner}>
					<WarningIcon />
					{intl.settings.lockedBanner}
				</div>
			)}

			<div className={styles.group}>
				<h3 className={styles.groupTitle}>{intl.settings.focusGroup}</h3>
				<SelectField
					label={intl.settings.workDurationLabel}
					description={intl.settings.workDurationDesc}
					icon={<WorkIcon />}
					value={settings.workTime}
					options={WORK_TIMES}
					unit={intl.settings.unitMin}
					disabled={isActive}
					color="var(--primary)"
					onChange={(v) => updateSettings({ workTime: v })}
				/>
			</div>

			<div className={styles.group}>
				<h3 className={styles.groupTitle}>{intl.settings.breaksGroup}</h3>
				<SelectField
					label={intl.settings.shortBreakLabel}
					description={intl.settings.shortBreakDesc}
					icon={<ShortBreakIcon />}
					value={settings.shortBreak}
					options={SHORT_BREAKS}
					unit={intl.settings.unitMin}
					disabled={isActive}
					color="var(--break)"
					onChange={(v) => updateSettings({ shortBreak: v })}
				/>
				<SelectField
					label={intl.settings.longBreakLabel}
					description={intl.settings.longBreakDesc}
					icon={<LongBreakIcon />}
					value={settings.longBreak}
					options={LONG_BREAKS}
					unit={intl.settings.unitMin}
					disabled={isActive}
					color="var(--break-long)"
					onChange={(v) => updateSettings({ longBreak: v })}
				/>
			</div>

			<div className={styles.group}>
				<h3 className={styles.groupTitle}>{intl.settings.cyclesGroup}</h3>
				<SelectField
					label={intl.settings.sessionsPerSetLabel}
					description={intl.settings.sessionsPerSetDesc}
					icon={<CycleIcon />}
					value={settings.cycles}
					options={CYCLES}
					unit={intl.settings.unitSessions}
					disabled={isActive}
					onChange={(v) => updateSettings({ cycles: v })}
				/>

				<div className={styles.cyclePreview}>
					{Array.from({ length: settings.cycles }, (_, i) => (
						<React.Fragment key={i}>
							<div className={styles.previewWork}>
								<span>🎯</span>
								<span className={styles.previewLabel}>
									{intl.settings.previewWork}
								</span>
							</div>
							{i < settings.cycles - 1 ? (
								<div className={styles.previewBreak}>
									<span>☕</span>
									<span className={styles.previewLabel}>
										{intl.settings.previewShort}
									</span>
								</div>
							) : (
								<div className={styles.previewLongBreak}>
									<span>🌿</span>
									<span className={styles.previewLabel}>
										{intl.settings.previewLong}
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
							{settings.workTime}
							{intl.common.minuteShort}
						</span>
						<span className={styles.summaryLabel}>
							{intl.settingsFocusCount(settings.cycles)}
						</span>
					</div>
					<span className={styles.summarySep}>+</span>
					<div className={styles.summaryItem}>
						<span
							className={styles.summaryValue}
							style={{ color: 'var(--break)' }}
						>
							{settings.shortBreak}
							{intl.common.minuteShort}
						</span>
						<span className={styles.summaryLabel}>
							{intl.settingsShortCount(settings.cycles - 1)}
						</span>
					</div>
					<span className={styles.summarySep}>+</span>
					<div className={styles.summaryItem}>
						<span
							className={styles.summaryValue}
							style={{ color: 'var(--break-long)' }}
						>
							{settings.longBreak}
							{intl.common.minuteShort}
						</span>
						<span className={styles.summaryLabel}>
							{intl.settings.summaryLongBreak}
						</span>
					</div>
					<span className={styles.summarySep}>=</span>
					<div className={styles.summaryItem}>
						<span className={styles.summaryValue}>
							{totalMinutes}
							{intl.common.minuteShort} = {totalHours}
							{intl.common.hourShort} {totalMinutesRemainder}
							{intl.common.minuteShort}
						</span>
						<span className={styles.summaryLabel}>
							{intl.settings.summaryTotal}
						</span>
					</div>
				</div>
			</div>

			<div className={styles.footer}>
				<a
					className={styles.reportLink}
					href={BUG_REPORT_URL}
					target="_blank"
					rel="noreferrer"
				>
					{intl.settings.reportBug}
				</a>
			</div>
		</div>
	);
}
