// Bell chime via Web Audio API — no file dependency
export function playCompletionSound(volume = 0.6): void {
  try {
    const ctx = new AudioContext()
    const notes = [
      { freq: 523.25, delay: 0 },
      { freq: 659.25, delay: 0.12 },
      { freq: 783.99, delay: 0.24 },
    ]

    notes.forEach(({ freq, delay }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.type = 'sine'
      osc.frequency.value = freq

      const t = ctx.currentTime + delay
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(volume * 0.35, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8)

      osc.start(t)
      osc.stop(t + 1.8)
    })

    setTimeout(() => ctx.close(), 3000)
  } catch {
    // AudioContext may be unavailable
  }
}
