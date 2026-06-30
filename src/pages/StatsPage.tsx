import { useMemo, useState } from 'react'
import { useStats } from '../hooks/useStats'
import { useIsDark } from '../hooks/useIsDark'

type Tooltip = { x: number; y: number; label: string; minutes: number; pomodoros: number } | null

export default function StatsPage() {
  const { getWeeklyData, getStreak, getTotals } = useStats()
  const isDark = useIsDark()
  const days = useMemo(() => getWeeklyData(), [])
  const streak = useMemo(() => getStreak(), [])
  const { totalPomodoros, totalMinutes } = useMemo(() => getTotals(), [])
  const [tooltip, setTooltip] = useState<Tooltip>(null)

  const maxPomodoros = Math.max(...days.map((d) => d.pomodoros), 1)
  const totalHours = Math.floor(totalMinutes / 60)
  const totalMins = totalMinutes % 60

  const barColors = {
    today: '#EF4444',
    hasSessions: isDark ? '#7F1D1D' : '#FECACA',
    empty: isDark ? '#1F2937' : '#F3F4F6',
  }

  return (
    <main className="min-h-[calc(100vh-65px)] bg-gray-50 dark:bg-gray-950 px-4 py-10 transition-colors duration-300">
      <div className="max-w-lg mx-auto flex flex-col gap-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">This Week</h1>

        {/* Bar chart */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm transition-colors duration-300">
          <div className="flex items-end justify-between gap-3 h-36">
            {days.map((day) => {
              const heightPct = (day.pomodoros / maxPomodoros) * 100
              const isToday = day.label === 'Today'
              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center gap-2 cursor-default"
                  onMouseMove={(e) =>
                    setTooltip({ x: e.clientX, y: e.clientY, label: day.label, minutes: day.minutes, pomodoros: day.pomodoros })
                  }
                  onMouseLeave={() => setTooltip(null)}
                >
                  <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                    {day.pomodoros > 0 ? day.pomodoros : ''}
                  </span>
                  <div className="w-full flex items-end" style={{ height: '88px' }}>
                    <div
                      className="w-full rounded-t-md transition-all duration-500"
                      style={{
                        height: day.pomodoros === 0 ? '4px' : `${heightPct}%`,
                        backgroundColor: isToday
                          ? barColors.today
                          : day.pomodoros > 0
                            ? barColors.hasSessions
                            : barColors.empty,
                        minHeight: '4px',
                      }}
                    />
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isToday
                        ? 'text-gray-900 dark:text-gray-100'
                        : 'text-gray-400 dark:text-gray-600'
                    }`}
                  >
                    {day.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {tooltip && <BarTooltip tooltip={tooltip} isDark={isDark} />}

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard value={String(totalPomodoros)} label="Pomodoros" color="#EF4444" />
          <StatCard
            value={
              totalMinutes === 0
                ? '0m'
                : totalHours > 0
                  ? `${totalHours}h ${totalMins}m`
                  : `${totalMins}m`
            }
            label="Focus time"
            color="#10B981"
          />
          <StatCard
            value={streak > 0 ? `${streak}` : '—'}
            label={streak === 1 ? 'day streak' : 'day streak'}
            color="#8B5CF6"
            icon={streak > 0 ? '🔥' : undefined}
          />
        </div>

        {totalPomodoros === 0 && (
          <p className="text-center text-sm text-gray-400 dark:text-gray-600 py-4">
            No sessions yet this week. Start your first Pomodoro!
          </p>
        )}
      </div>
    </main>
  )
}

function BarTooltip({ tooltip, isDark }: { tooltip: NonNullable<Tooltip>; isDark: boolean }) {
  const { x, y, label, minutes, pomodoros } = tooltip
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  const timeStr = minutes === 0 ? 'No sessions' : hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`
  const pomoStr = pomodoros === 1 ? '1 pomodoro' : `${pomodoros} pomodoros`

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{ left: x + 14, top: y - 10 }}
    >
      <div
        className="rounded-lg px-3 py-2 text-xs shadow-lg border"
        style={{
          background: isDark ? '#1F2937' : '#fff',
          borderColor: isDark ? '#374151' : '#E5E7EB',
          color: isDark ? '#F9FAFB' : '#111827',
          whiteSpace: 'nowrap',
        }}
      >
        <div className="font-semibold mb-0.5">{label}</div>
        <div style={{ color: '#EF4444' }}>{timeStr}</div>
        {pomodoros > 0 && (
          <div className="opacity-60 mt-0.5">{pomoStr}</div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  value,
  label,
  color,
  icon,
}: {
  value: string
  label: string
  color: string
  icon?: string
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm flex flex-col gap-1 transition-colors duration-300">
      <span className="text-2xl font-bold leading-tight" style={{ color }}>
        {icon && <span className="mr-1">{icon}</span>}
        {value}
      </span>
      <span className="text-xs text-gray-400 dark:text-gray-500 font-medium leading-tight">
        {label}
      </span>
    </div>
  )
}
