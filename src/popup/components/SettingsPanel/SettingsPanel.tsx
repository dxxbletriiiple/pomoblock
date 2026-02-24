import React from 'react';
import styles from './SettingsPanel.module.css';
import { Settings, TimerStatus } from '../../../shared/types';

interface Props {
  settings: Settings;
  timerStatus: TimerStatus;
  onChange: (patch: Partial<Settings>) => void;
}

const WORK_TIMES = [15, 20, 25, 30, 45, 60, 90];
const SHORT_BREAKS = [5, 10];
const LONG_BREAKS = [15, 20, 30];
const CYCLES = [2, 3, 4, 5, 6];

interface SelectFieldProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  value: number;
  options: number[];
  unit: string;
  disabled: boolean;
  color?: string;
  onChange: (v: number) => void;
}

function SelectField({ label, description, icon, value, options, unit, disabled, color, onChange }: SelectFieldProps) {
  return (
    <div className={`${styles.field} ${disabled ? styles.fieldDisabled : ''}`}>
      <div className={styles.fieldLeft}>
        <div className={styles.fieldIcon} style={color ? { background: `${color}20`, color } : undefined}>
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Settings are locked while timer is running. Reset to make changes.
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
                <span className={styles.previewLabel}>Work</span>
              </div>
              {i < settings.cycles - 1 ? (
                <div className={styles.previewBreak}>
                  <span>☕</span>
                  <span className={styles.previewLabel}>Short</span>
                </div>
              ) : (
                <div className={styles.previewLongBreak}>
                  <span>🌿</span>
                  <span className={styles.previewLabel}>Long</span>
                </div>
              )}
              {i < settings.cycles - 1 && <div className={styles.previewArrow}>→</div>}
            </React.Fragment>
          ))}
        </div>

        <div className={styles.cycleSummary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryValue} style={{ color: 'var(--primary)' }}>{settings.workTime}m</span>
            <span className={styles.summaryLabel}>× {settings.cycles} focus</span>
          </div>
          <span className={styles.summarySep}>+</span>
          <div className={styles.summaryItem}>
            <span className={styles.summaryValue} style={{ color: 'var(--break)' }}>{settings.shortBreak}m</span>
            <span className={styles.summaryLabel}>× {settings.cycles - 1} short</span>
          </div>
          <span className={styles.summarySep}>+</span>
          <div className={styles.summaryItem}>
            <span className={styles.summaryValue} style={{ color: 'var(--break-long)' }}>{settings.longBreak}m</span>
            <span className={styles.summaryLabel}>long break</span>
          </div>
          <span className={styles.summarySep}>=</span>
          <div className={styles.summaryItem}>
            <span className={styles.summaryValue}>
              {settings.workTime * settings.cycles + settings.shortBreak * (settings.cycles - 1) + settings.longBreak}m
            </span>
            <span className={styles.summaryLabel}>total</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ShortBreakIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  );
}

function LongBreakIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function CycleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}
