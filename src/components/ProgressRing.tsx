interface Props {
  progress: number  // 0..1
  color: string
  size?: number
  strokeWidth?: number
}

export default function ProgressRing({
  progress,
  color,
  size = 260,
  strokeWidth = 10,
}: Props) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - Math.max(0, Math.min(1, progress)))

  return (
    <svg
      width={size}
      height={size}
      style={{ transform: 'rotate(-90deg)' }}
      aria-hidden="true"
    >
      {/* Track — color comes from CSS variable so dark mode works */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--ring-track)"
        strokeWidth={strokeWidth}
      />
      {/* Progress */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        className="ring-transition"
      />
    </svg>
  )
}
