import { Settings, TimerState } from '../../../shared/types';

export interface TimerProps {
	timer: TimerState;
	settings: Settings;
	onStart: () => void;
	onPause: () => void;
	onResume: () => void;
	onReset: () => void;
	onSkip: () => void;
}
