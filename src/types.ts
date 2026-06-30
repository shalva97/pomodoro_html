export type TimerMode = 'focus' | 'short-break' | 'long-break'

export interface TimerSettings {
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  longBreakInterval: number
  soundEnabled: boolean
  soundVolume: number   // 0–1
}

export interface Session {
  id: string
  date: string          // YYYY-MM-DD
  type: 'focus' | 'break'
  durationMinutes: number
  completedAt: number   // timestamp ms
}

export interface DayStats {
  date: string
  label: string
  pomodoros: number
  minutes: number
}
