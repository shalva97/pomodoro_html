import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TimerProvider } from './store/timerContext'
import NavBar from './components/NavBar'
import TimerPage from './pages/TimerPage'
import StatsPage from './pages/StatsPage'
import SettingsPage from './pages/SettingsPage'

function initDark(): boolean {
  const stored = localStorage.getItem('pomo-theme')
  if (stored) return stored === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export default function App() {
  const [isDark, setIsDark] = useState(initDark)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('pomo-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <BrowserRouter>
      <TimerProvider>
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
          <NavBar isDark={isDark} onToggle={() => setIsDark((d) => !d)} />
          <Routes>
            <Route path="/" element={<TimerPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </TimerProvider>
    </BrowserRouter>
  )
}
