import { useTimer } from '../store/timerContext'
import { useIsDark } from '../hooks/useIsDark'
import type { TimerMode, TimerSettings } from '../types'

interface SliderConfig {
  min: number
  max: number
  step: number
}

const CONFIG: Record<TimerMode, SliderConfig> = {
  focus:         { min: 10, max: 90, step: 5 },
  'short-break': { min: 1,  max: 30, step: 1 },
  'long-break':  { min: 10, max: 60, step: 5 },
}

function currentDuration(mode: TimerMode, settings: TimerSettings): number {
  if (mode === 'focus') return settings.focusDuration
  if (mode === 'short-break') return settings.shortBreakDuration
  return settings.longBreakDuration
}

interface Props {
  accentColor: string
}

export default function DurationPicker({ accentColor }: Props) {
  const { state, updateSettings } = useTimer()
  const isDark = useIsDark()
  const { min, max, step } = CONFIG[state.mode]
  const value = currentDuration(state.mode, state.settings)

  const pct = ((value - min) / (max - min)) * 100
  const trackBg = isDark ? '#1f2937' : '#e5e7eb'
  const trackStyle = {
    background: `linear-gradient(to right, ${accentColor} ${pct}%, ${trackBg} ${pct}%)`,
    '--accent': accentColor,
  } as React.CSSProperties

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const mins = Number(e.target.value)
    if (state.mode === 'focus') updateSettings({ focusDuration: mins })
    else if (state.mode === 'short-break') updateSettings({ shortBreakDuration: mins })
    else updateSettings({ longBreakDuration: mins })
  }

  return (
    <div className="flex flex-col items-center gap-3 w-72">
      {/* Value display */}
      <div className="flex items-baseline gap-1">
        <span
          className="text-4xl font-bold tabular-nums leading-none"
          style={{ color: accentColor }}
        >
          {value}
        </span>
        <span className="text-sm font-medium text-gray-400 dark:text-gray-500">min</span>
      </div>

      {/* Slider */}
      <div className="w-full">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          style={trackStyle}
          className="pomo-slider"
        />
        <div className="flex justify-between mt-1.5 px-0.5">
          <span className="text-xs text-gray-300 dark:text-gray-600">{min}m</span>
          <span className="text-xs text-gray-300 dark:text-gray-600">{max}m</span>
        </div>
      </div>
    </div>
  )
}
