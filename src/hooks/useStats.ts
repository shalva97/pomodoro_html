import type { DayStats, Session } from '../types'

function loadSessions(): Session[] {
  try {
    return JSON.parse(localStorage.getItem('pomo-sessions') ?? '[]')
  } catch {
    return []
  }
}

export function useStats() {
  const getWeeklyData = (): DayStats[] => {
    const sessions = loadSessions()
    const today = new Date()
    const days: DayStats[] = []

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      const label =
        i === 0
          ? 'Today'
          : d.toLocaleDateString('en-US', { weekday: 'short' })

      const daySessions = sessions.filter(
        (s) => s.date === dateStr && s.type === 'focus',
      )
      days.push({
        date: dateStr,
        label,
        pomodoros: daySessions.length,
        minutes: daySessions.reduce((sum, s) => sum + s.durationMinutes, 0),
      })
    }
    return days
  }

  const getStreak = (): number => {
    const sessions = loadSessions()
    const focusDates = new Set(
      sessions.filter((s) => s.type === 'focus').map((s) => s.date),
    )
    if (focusDates.size === 0) return 0

    let streak = 0
    const d = new Date()

    // If today has no session yet, start counting from yesterday
    if (!focusDates.has(d.toISOString().slice(0, 10))) {
      d.setDate(d.getDate() - 1)
    }

    while (focusDates.has(d.toISOString().slice(0, 10))) {
      streak++
      d.setDate(d.getDate() - 1)
    }
    return streak
  }

  const getTotals = () => {
    const weekly = getWeeklyData()
    return {
      totalPomodoros: weekly.reduce((s, d) => s + d.pomodoros, 0),
      totalMinutes: weekly.reduce((s, d) => s + d.minutes, 0),
    }
  }

  const getTodayStats = (): { pomodoros: number; minutes: number } => {
    const sessions = loadSessions()
    const today = new Date().toISOString().slice(0, 10)
    const todaySessions = sessions.filter((s) => s.date === today && s.type === 'focus')
    return {
      pomodoros: todaySessions.length,
      minutes: todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0),
    }
  }

  return { getWeeklyData, getStreak, getTotals, getTodayStats }
}
