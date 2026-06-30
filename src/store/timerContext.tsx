import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useCallback,
} from 'react'
import type { TimerMode, TimerSettings, Session } from '../types'
import { playCompletionSound } from '../utils/sound'
import { setFavicon } from '../utils/favicon'

// ─── State ────────────────────────────────────────────────────────────────────

interface TimerState {
  mode: TimerMode
  timeLeft: number      // seconds
  isRunning: boolean
  justCompleted: boolean
  settings: TimerSettings
  completedPomodoros: number
}

type Action =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'TICK'; timeLeft: number }
  | { type: 'SET_MODE'; mode: TimerMode }
  | { type: 'COMPLETE' }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<TimerSettings> }

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: TimerSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  soundEnabled: true,
  soundVolume: 0.6,
}

function modeDuration(mode: TimerMode, s: TimerSettings): number {
  if (mode === 'focus') return s.focusDuration * 60
  if (mode === 'short-break') return s.shortBreakDuration * 60
  return s.longBreakDuration * 60
}

function nextMode(
  current: TimerMode,
  completedPomodoros: number,
  interval: number,
): TimerMode {
  if (current !== 'focus') return 'focus'
  return completedPomodoros % interval === 0 ? 'long-break' : 'short-break'
}

function loadSettings(): TimerSettings {
  try {
    const raw = localStorage.getItem('pomo-settings')
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS
}

interface PersistedTimer {
  mode: TimerMode
  timeLeft: number
  isRunning: boolean
  completedPomodoros: number
  savedAt: number
}

function saveTimerState(state: TimerState) {
  const data: PersistedTimer = {
    mode: state.mode,
    timeLeft: state.timeLeft,
    isRunning: state.isRunning,
    completedPomodoros: state.completedPomodoros,
    savedAt: Date.now(),
  }
  localStorage.setItem('pomo-timer', JSON.stringify(data))
}

function loadTimerState(): Omit<PersistedTimer, 'savedAt'> | null {
  try {
    const raw = localStorage.getItem('pomo-timer')
    if (!raw) return null
    const data: PersistedTimer = JSON.parse(raw)
    let { mode, timeLeft, isRunning, completedPomodoros, savedAt } = data
    if (isRunning) {
      timeLeft = timeLeft - Math.floor((Date.now() - savedAt) / 1000)
      if (timeLeft <= 0) {
        timeLeft = 0
        isRunning = false
      }
    }
    return { mode, timeLeft, isRunning, completedPomodoros }
  } catch {
    return null
  }
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: TimerState, action: Action): TimerState {
  switch (action.type) {
    case 'TICK':
      if (action.timeLeft <= 0) {
        return { ...state, timeLeft: 0, isRunning: false, justCompleted: true }
      }
      return { ...state, timeLeft: action.timeLeft }

    case 'START':
      return { ...state, isRunning: true, justCompleted: false }

    case 'PAUSE':
      return { ...state, isRunning: false }

    case 'RESET':
      return {
        ...state,
        isRunning: false,
        justCompleted: false,
        timeLeft: modeDuration(state.mode, state.settings),
      }

    case 'SET_MODE':
      return {
        ...state,
        mode: action.mode,
        isRunning: false,
        justCompleted: false,
        timeLeft: modeDuration(action.mode, state.settings),
      }

    case 'COMPLETE': {
      const newCount =
        state.mode === 'focus'
          ? state.completedPomodoros + 1
          : state.completedPomodoros
      const next = nextMode(state.mode, newCount, state.settings.longBreakInterval)
      return {
        ...state,
        mode: next,
        isRunning: false,
        justCompleted: false,
        timeLeft: modeDuration(next, state.settings),
        completedPomodoros: newCount,
      }
    }

    case 'UPDATE_SETTINGS': {
      const s = { ...state.settings, ...action.settings }
      return {
        ...state,
        settings: s,
        isRunning: false,
        justCompleted: false,
        timeLeft: modeDuration(state.mode, s),
      }
    }
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface ContextValue {
  state: TimerState
  totalDuration: number
  start: () => void
  pause: () => void
  reset: () => void
  setMode: (mode: TimerMode) => void
  updateSettings: (s: Partial<TimerSettings>) => void
}

const TimerContext = createContext<ContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const settings = loadSettings()
  const persisted = loadTimerState()
  const [state, dispatch] = useReducer(reducer, {
    mode: persisted?.mode ?? 'focus',
    timeLeft: persisted?.timeLeft ?? settings.focusDuration * 60,
    isRunning: persisted?.isRunning ?? false,
    justCompleted: false,
    settings,
    completedPomodoros: persisted?.completedPomodoros ?? 0,
  })

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // Wall-clock anchor: set when the timer starts/resumes so elapsed time is always computed correctly
  // even if the browser throttled or suspended setInterval in a background tab.
  const startedAtRef = useRef<number>(0)
  const timeLeftAtStartRef = useRef<number>(0)

  // Tick
  useEffect(() => {
    if (state.isRunning) {
      startedAtRef.current = Date.now()
      timeLeftAtStartRef.current = state.timeLeft
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000)
        const timeLeft = Math.max(0, timeLeftAtStartRef.current - elapsed)
        dispatch({ type: 'TICK', timeLeft })
      }, 500)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [state.isRunning])

  // Completion side-effects
  useEffect(() => {
    if (!state.justCompleted) return

    sendNotification(state.mode)
    if (state.settings.soundEnabled) playCompletionSound(state.settings.soundVolume)
    persistSession(state.mode, state.settings)

    const t = setTimeout(() => dispatch({ type: 'COMPLETE' }), 1200)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.justCompleted])

  // Persist settings
  useEffect(() => {
    localStorage.setItem('pomo-settings', JSON.stringify(state.settings))
  }, [state.settings])

  // Persist timer state (skip transient justCompleted flash so we don't restore a 0-second timer)
  useEffect(() => {
    if (state.justCompleted) return
    saveTimerState(state)
  }, [state.isRunning, state.mode, state.completedPomodoros, state.timeLeft])

  // Update page title + favicon
  useEffect(() => {
    const mm = String(Math.floor(state.timeLeft / 60)).padStart(2, '0')
    const ss = String(state.timeLeft % 60).padStart(2, '0')
    const label = state.mode === 'focus' ? 'Focus' : 'Break'
    document.title = state.isRunning ? `${mm}:${ss} · ${label}` : 'Pomodoro'

    if (state.isRunning && state.mode === 'focus') setFavicon('focus')
    else if (state.isRunning) setFavicon('break')
    else setFavicon('idle')
  }, [state.timeLeft, state.isRunning, state.mode])

  const start = useCallback(() => {
    if (Notification.permission === 'default') Notification.requestPermission()
    dispatch({ type: 'START' })
  }, [])

  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), [])
  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])
  const setMode = useCallback(
    (mode: TimerMode) => dispatch({ type: 'SET_MODE', mode }),
    [],
  )
  const updateSettings = useCallback(
    (s: Partial<TimerSettings>) => dispatch({ type: 'UPDATE_SETTINGS', settings: s }),
    [],
  )

  const totalDuration = modeDuration(state.mode, state.settings)

  return (
    <TimerContext.Provider
      value={{ state, totalDuration, start, pause, reset, setMode, updateSettings }}
    >
      {children}
    </TimerContext.Provider>
  )
}

export function useTimer() {
  const ctx = useContext(TimerContext)
  if (!ctx) throw new Error('useTimer must be used within TimerProvider')
  return ctx
}

// ─── Side-effect helpers (outside React tree) ─────────────────────────────────

function sendNotification(mode: TimerMode) {
  if (Notification.permission !== 'granted') return
  const isFocus = mode === 'focus'
  const n = new Notification(isFocus ? 'Focus session complete!' : 'Break over!', {
    body: isFocus
      ? 'Great work. Time for a well-deserved break.'
      : 'Ready to get back to it?',
    icon: '/icon.svg',
    silent: false,
  })
  n.onclick = () => {
    window.focus()
    n.close()
  }
}

function persistSession(mode: TimerMode, settings: TimerSettings) {
  const session: Session = {
    id: Math.random().toString(36).slice(2),
    date: new Date().toISOString().slice(0, 10),
    type: mode === 'focus' ? 'focus' : 'break',
    durationMinutes:
      mode === 'focus'
        ? settings.focusDuration
        : mode === 'short-break'
          ? settings.shortBreakDuration
          : settings.longBreakDuration,
    completedAt: Date.now(),
  }
  try {
    const existing: Session[] = JSON.parse(
      localStorage.getItem('pomo-sessions') ?? '[]',
    )
    localStorage.setItem('pomo-sessions', JSON.stringify([...existing, session]))
  } catch {
    // ignore
  }
}
