import { useState, useEffect, useCallback } from 'react'
import { useTimer } from '../store/timerContext'
import { useIsDark } from '../hooks/useIsDark'
import { playCompletionSound } from '../utils/sound'

const ACCENT = '#6366F1'

type NotifFeedback = 'sent' | 'error' | 'blocked' | null

export default function SettingsPage() {
  const { state, updateSettings } = useTimer()
  const { settings } = state
  const isDark = useIsDark()

  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied',
  )
  const [notifFeedback, setNotifFeedback] = useState<NotifFeedback>(null)
  const [soundFeedback, setSoundFeedback] = useState(false)

  // Keep permission state in sync with the live browser value
  useEffect(() => {
    setNotifPermission(Notification.permission)
  }, [])

  function sliderStyle(value: number, min: number, max: number) {
    const pct = ((value - min) / (max - min)) * 100
    const track = isDark ? '#1f2937' : '#e5e7eb'
    return {
      background: `linear-gradient(to right, ${ACCENT} ${pct}%, ${track} ${pct}%)`,
      '--accent': ACCENT,
    } as React.CSSProperties
  }

  async function enableNotifications() {
    const result = await Notification.requestPermission()
    setNotifPermission(result)
  }

  const sendTestNotification = useCallback(() => {
    // Always re-read live permission — state may lag behind browser
    const live = Notification.permission
    setNotifPermission(live)

    if (live !== 'granted') {
      setNotifFeedback('blocked')
      setTimeout(() => setNotifFeedback(null), 3000)
      return
    }

    try {
      new Notification('Pomodoro – test notification', {
        body: 'Notifications are working correctly.',
        icon: '/icon.svg',
      })
      setNotifFeedback('sent')
    } catch {
      setNotifFeedback('error')
    }
    setTimeout(() => setNotifFeedback(null), 3000)
  }, [])

  function handleTestSound() {
    playCompletionSound(settings.soundEnabled ? settings.soundVolume : 0.6)
    setSoundFeedback(true)
    setTimeout(() => setSoundFeedback(false), 2000)
  }

  return (
    <main className="min-h-[calc(100vh-65px)] flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-md space-y-5">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

        {/* ── Timer Durations ── */}
        <Card title="Timer Durations">
          <SliderRow
            label="Focus"
            value={settings.focusDuration}
            unit="min"
            min={10} max={90} step={5}
            style={sliderStyle(settings.focusDuration, 10, 90)}
            onChange={(v) => updateSettings({ focusDuration: v })}
          />
          <SliderRow
            label="Short Break"
            value={settings.shortBreakDuration}
            unit="min"
            min={1} max={30} step={1}
            style={sliderStyle(settings.shortBreakDuration, 1, 30)}
            onChange={(v) => updateSettings({ shortBreakDuration: v })}
          />
          <SliderRow
            label="Long Break"
            value={settings.longBreakDuration}
            unit="min"
            min={10} max={60} step={5}
            style={sliderStyle(settings.longBreakDuration, 10, 60)}
            onChange={(v) => updateSettings({ longBreakDuration: v })}
          />
          <SliderRow
            label="Long Break Every"
            value={settings.longBreakInterval}
            unit="sessions"
            min={2} max={8} step={1}
            style={sliderStyle(settings.longBreakInterval, 2, 8)}
            onChange={(v) => updateSettings({ longBreakInterval: v })}
          />
        </Card>

        {/* ── Notifications ── */}
        <Card title="Notifications">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Permission</span>
            <PermissionBadge status={notifPermission} />
          </div>

          <div className="mt-4">
            {notifPermission === 'default' && (
              <button
                onClick={enableNotifications}
                className="w-full py-2.5 text-sm font-medium rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
              >
                Enable Notifications
              </button>
            )}
            {notifPermission === 'denied' && (
              <p className="text-xs text-center text-gray-400 dark:text-gray-500">
                Notifications are blocked by the browser. Allow them in your browser&apos;s site
                settings, then reload.
              </p>
            )}
            {notifPermission === 'granted' && (
              <button
                onClick={sendTestNotification}
                className="w-full py-2.5 text-sm font-medium rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Send Test Notification
              </button>
            )}
            {notifFeedback === 'sent' && (
              <p className="mt-2 text-xs text-center text-emerald-500">
                Notification sent — check your system notification area.
              </p>
            )}
            {notifFeedback === 'blocked' && (
              <p className="mt-2 text-xs text-center text-amber-500">
                Permission is blocked. Allow notifications in your browser site settings.
              </p>
            )}
            {notifFeedback === 'error' && (
              <p className="mt-2 text-xs text-center text-red-500">
                Notification failed. Check browser console for details.
              </p>
            )}
          </div>
        </Card>

        {/* ── Sound ── */}
        <Card title="Sound">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">Play sound on completion</span>
            <Toggle
              checked={settings.soundEnabled}
              onChange={(v) => updateSettings({ soundEnabled: v })}
            />
          </div>

          {settings.soundEnabled && (
            <SliderRow
              label="Volume"
              value={Math.round(settings.soundVolume * 100)}
              unit="%"
              min={0} max={100} step={5}
              style={sliderStyle(settings.soundVolume * 100, 0, 100)}
              onChange={(v) => updateSettings({ soundVolume: v / 100 })}
            />
          )}

          <button
            onClick={handleTestSound}
            className="mt-4 w-full py-2.5 text-sm font-medium rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <SpeakerIcon />
            {soundFeedback ? 'Playing…' : 'Play Test Sound'}
          </button>
        </Card>
      </div>
    </main>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
        {title}
      </h2>
      {children}
    </div>
  )
}

interface SliderRowProps {
  label: string
  value: number
  unit: string
  min: number
  max: number
  step: number
  style: React.CSSProperties
  onChange: (v: number) => void
}

function SliderRow({ label, value, unit, min, max, step, style, onChange }: SliderRowProps) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
        <span className="text-sm font-semibold tabular-nums" style={{ color: ACCENT }}>
          {value}
          <span className="text-xs font-normal text-gray-400 dark:text-gray-500 ml-0.5">
            {unit}
          </span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={style}
        onChange={(e) => onChange(Number(e.target.value))}
        className="pomo-slider"
      />
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
        checked ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

function PermissionBadge({ status }: { status: NotificationPermission }) {
  const map = {
    granted: { label: 'Granted', classes: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' },
    denied:  { label: 'Blocked', classes: 'bg-red-50 dark:bg-red-950/50 text-red-500 dark:text-red-400' },
    default: { label: 'Not requested', classes: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400' },
  }
  const { label, classes } = map[status]
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${classes}`}>{label}</span>
  )
}

function SpeakerIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  )
}
