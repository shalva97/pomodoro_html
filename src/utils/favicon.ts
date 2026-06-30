type FaviconState = 'focus' | 'break' | 'idle'

const COLORS: Record<FaviconState, string> = {
  focus: '#EF4444',
  break: '#3B82F6',
  idle:  '#9CA3AF',
}

function makeSvg(color: string): string {
  // Tomato circle + green stem
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="18" r="13" fill="${color}"/><rect x="14.5" y="3" width="3" height="7" rx="1.5" fill="#4ADE80"/></svg>`
}

let linkEl: HTMLLinkElement | null = null

function getLink(): HTMLLinkElement {
  if (!linkEl) {
    linkEl = document.querySelector<HTMLLinkElement>('link[rel="icon"][type="image/svg+xml"]')
    if (!linkEl) {
      linkEl = document.createElement('link')
      linkEl.rel = 'icon'
      linkEl.type = 'image/svg+xml'
      document.head.appendChild(linkEl)
    }
  }
  return linkEl
}

let current: FaviconState | null = null

export function setFavicon(state: FaviconState): void {
  if (state === current) return
  current = state
  getLink().href = `data:image/svg+xml,${encodeURIComponent(makeSvg(COLORS[state]))}`
}
