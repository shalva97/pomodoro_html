import { NavLink } from 'react-router-dom'

interface Props {
  isDark: boolean
  onToggle: () => void
}

export default function NavBar({ isDark, onToggle }: Props) {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10 transition-colors duration-300">
      <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">
        Pomodoro
      </span>

      <div className="flex items-center gap-1">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isActive
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`
          }
        >
          Timer
        </NavLink>
        <NavLink
          to="/stats"
          className={({ isActive }) =>
            `px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isActive
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`
          }
        >
          Stats
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isActive
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`
          }
        >
          Settings
        </NavLink>

        <button
          onClick={onToggle}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="ml-2 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </nav>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}
