import { useEffect } from 'react'
import { useTimer } from '../store/timerContext'
import { useIsDark } from '../hooks/useIsDark'
import { useStats } from '../hooks/useStats'
import ModeSelector from '../components/ModeSelector'
import type { TimerMode, TimerSettings } from '../types'

const MODE_COLORS: Record<TimerMode, string> = {
  focus: '#EF4444',
  'short-break': '#10B981',
  'long-break': '#8B5CF6',
}

const MODE_BG: Record<TimerMode, { light: string; dark: string }> = {
  focus: { light: '#FFF8F8', dark: '#1A0F0F' },
  'short-break': { light: '#F0FDF9', dark: '#0D1A15' },
  'long-break': { light: '#FAF5FF', dark: '#130F1A' },
}

const STEP: Record<TimerMode, number> = { focus: 5, 'short-break': 1, 'long-break': 5 }
const MIN:  Record<TimerMode, number> = { focus: 10, 'short-break': 1, 'long-break': 10 }
const MAX:  Record<TimerMode, number> = { focus: 90, 'short-break': 30, 'long-break': 60 }

function currentDuration(mode: TimerMode, s: TimerSettings): number {
  if (mode === 'focus') return s.focusDuration
  if (mode === 'short-break') return s.shortBreakDuration
  return s.longBreakDuration
}

function settingKey(mode: TimerMode): keyof TimerSettings {
  if (mode === 'focus') return 'focusDuration'
  if (mode === 'short-break') return 'shortBreakDuration'
  return 'longBreakDuration'
}

export default function TimerPage() {
  const { state, start, pause, reset, updateSettings } = useTimer()
  const { getTodayStats } = useStats()
  const today = getTodayStats()
  const isDark = useIsDark()
  const color = MODE_COLORS[state.mode]
  const bg = isDark ? MODE_BG[state.mode].dark : MODE_BG[state.mode].light

  const mm = String(Math.floor(state.timeLeft / 60)).padStart(2, '0')
  const ss = String(state.timeLeft % 60).padStart(2, '0')

  const duration = currentDuration(state.mode, state.settings)
  const step = STEP[state.mode]
  const canDec = !state.isRunning && duration - step >= MIN[state.mode]
  const canInc = !state.isRunning && duration + step <= MAX[state.mode]

  function adjust(delta: number) {
    const next = Math.max(MIN[state.mode], Math.min(MAX[state.mode], duration + delta))
    updateSettings({ [settingKey(state.mode)]: next } as Partial<TimerSettings>)
  }

  // Space → start/pause
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault()
        state.isRunning ? pause() : start()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state.isRunning, start, pause])

  return (
    <main
      className="min-h-[calc(100vh-65px)] flex flex-col items-center justify-center gap-10 px-4 py-10 timer-transition"
      style={{ backgroundColor: bg }}
    >
      <ModeSelector />

      {/* Time display + adjust buttons */}
      <div
        className="flex flex-col items-center select-none gap-2"
        onWheel={(e) => {
          if (state.isRunning) return
          e.preventDefault()
          adjust(e.deltaY < 0 ? step : -step)
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => adjust(-step)}
            disabled={!canDec}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 transition-all disabled:opacity-25 disabled:pointer-events-none"
          >
            <MinusIcon />
          </button>

          <span
            className="text-5xl font-bold tabular-nums tracking-tight leading-none"
            style={{ color: state.justCompleted ? color : isDark ? '#F9FAFB' : '#111827' }}
          >
            {mm}:{ss}
          </span>

          <button
            onClick={() => adjust(step)}
            disabled={!canInc}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 transition-all disabled:opacity-25 disabled:pointer-events-none"
          >
            <PlusIcon />
          </button>
        </div>

        <span className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          {state.mode === 'focus'
            ? 'Focus'
            : state.mode === 'short-break'
              ? 'Short Break'
              : 'Long Break'}
        </span>
        {today.pomodoros > 0 && (
          <span className="text-xs text-gray-300 dark:text-gray-600">
            {today.pomodoros} done · {today.minutes} min today
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="w-11 h-11 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all"
          title="Reset"
        >
          <ResetIcon />
        </button>

        <button
          onClick={state.isRunning ? pause : start}
          style={{ backgroundColor: color }}
          className="w-28 h-12 rounded-xl flex items-center justify-center text-white shadow-lg hover:opacity-90 active:scale-95 transition-all"
          title="Start/Pause (Space)"
        >
          {state.isRunning ? <PauseIcon /> : <PlayIcon />}
        </button>

        <div className="w-11" />
      </div>

    </main>
  )
}

function PlayIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  )
}

function ResetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
}

function MinusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M5 12h14" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
