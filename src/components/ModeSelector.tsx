import { useTimer } from '../store/timerContext'
import type { TimerMode } from '../types'

const MODES: { id: TimerMode; label: string }[] = [
  { id: 'focus', label: 'Focus' },
  { id: 'short-break', label: 'Short Break' },
  { id: 'long-break', label: 'Long Break' },
]

export default function ModeSelector() {
  const { state, setMode } = useTimer()

  return (
    <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-full p-1 transition-colors duration-300">
      {MODES.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => setMode(id)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            state.mode === id
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
