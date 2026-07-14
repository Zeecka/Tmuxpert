import type { ReactNode } from 'react'
import type { Mode } from '../tmux/model'

/** Row of up to 3 stars, `value` filled. */
export function StarRow({ value, size = 20 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-1" aria-label={`${value} of 3 stars`}>
      {[1, 2, 3].map((i) => (
        <span key={i} style={{ fontSize: size }} className={i <= value ? 'text-amber glow-amber' : 'text-border'}>
          ★
        </span>
      ))}
    </span>
  )
}

const MODE_STYLES: Record<Mode, { label: string; cls: string }> = {
  normal: { label: 'NORMAL', cls: 'text-term border-term/40 bg-term/10' },
  prefix: { label: 'PREFIX', cls: 'text-amber border-amber/40 bg-amber/10' },
  copy: { label: 'COPY', cls: 'text-cyan border-cyan/40 bg-cyan/10' },
  command: { label: 'COMMAND', cls: 'text-amber border-amber/40 bg-amber/10' },
  'rename-window': { label: 'RENAME', cls: 'text-magenta border-magenta/40 bg-magenta/10' },
  'rename-session': { label: 'RENAME', cls: 'text-magenta border-magenta/40 bg-magenta/10' },
}

/** The current tmux mode indicator — a filled pill per mode. */
export function ModeBadge({ mode }: { mode: Mode }) {
  const m = MODE_STYLES[mode] ?? MODE_STYLES.normal
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-bold tracking-[0.2em] tabular-nums ${m.cls}`}>
      {m.label}
    </span>
  )
}

/** A keyboard keycap. */
export function KeyCap({ children }: { children: ReactNode }) {
  return <kbd className="keycap">{children}</kbd>
}
