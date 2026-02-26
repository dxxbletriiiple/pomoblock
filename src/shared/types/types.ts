export interface Settings {
  workTime: number;    // 15|20|25|30|45|60|90
  shortBreak: number;  // 5|10
  longBreak: number;   // 15|20|30
  cycles: number;      // 2-6
  theme: 'light' | 'dark';
}

export type TimerPhase = 'work' | 'shortBreak' | 'longBreak';
export type TimerStatus = 'idle' | 'running' | 'paused';

export interface TimerState {
  status: TimerStatus;
  phase: TimerPhase;
  completedSessions: number;  // work sessions done in current set (0 to cycles)
  endTime: number | null;     // Unix ms when current phase ends
  remainingMs: number | null; // ms remaining when paused
}

export interface AppState {
  settings: Settings;
  blockedSites: string[];
  timer: TimerState;
}

export type AppMessage =
  | { type: 'GET_STATE' }
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESET' }
  | { type: 'SKIP' }
  | { type: 'UPDATE_SITES'; sites: string[] }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<Settings> };

export interface MessageResponse {
  success: boolean;
  state?: AppState;
  error?: string;
}
