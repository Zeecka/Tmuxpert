import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { CHEAT_ROW_COUNT, PREFIX_LABEL, filterCheatsheet, type CheatRow } from '../game/cheatsheet'
import { downloadCheatsheetPdf } from '../game/pdf'
import { Emoji } from './Emoji'
import { sfx } from '../game/sound'

/**
 * The in-app tmux cheatsheet: every binding the game teaches (plus the real-tmux
 * reference around it), searchable, with the ones you can practise here flagged.
 * Downloadable as a PDF generated offline (see game/pdf.ts). Lazy-loaded
 * (default export) so the generator never weighs down the sync bundle.
 * Mirrors VimLegends's cheatsheet modal; ./Cheatsheet.tsx is the trigger.
 *
 * Rendered through a PORTAL to <body>. The trigger lives in the HUD, whose
 * `backdrop-blur` makes the header a containing block for fixed descendants —
 * without the portal, `fixed inset-0` would resolve against the 54px-tall header
 * instead of the viewport, and the sheet would open clipped off the top.
 */
export default function CheatsheetModal({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const sections = useMemo(() => filterCheatsheet(q), [q])

  useEffect(() => {
    panelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose])

  const toast = (msg: string) => {
    setFlash(msg)
    window.setTimeout(() => setFlash(null), 2400)
  }

  return createPortal(
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-bg/75 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.16 }}
      onClick={onClose}
    >
      <motion.div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="tmux cheatsheet"
        className="panel flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden outline-none"
        initial={{ scale: 0.94, y: 14, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <Emoji name="keyboard" size={20} />
            <div>
              <h2 className="font-terminal text-xl font-bold text-term">tmux Cheatsheet</h2>
              <p className="text-[11px] text-ink-dim">
                {CHEAT_ROW_COUNT} entries · default prefix <span className="text-term">{PREFIX_LABEL}</span> — press it,
                release, then the key
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close cheatsheet"
            className="rounded-full border border-border px-2.5 py-1 text-sm text-ink-dim transition-colors hover:border-danger hover:text-danger"
          >
            ✕
          </button>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3">
          <div className="relative flex-1 sm:max-w-xs">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter bindings..."
              aria-label="Filter bindings"
              className="w-full rounded-lg border border-border bg-panel-2/60 px-3 py-1.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-dim/60 focus:border-term"
            />
            {q && (
              <button
                onClick={() => setQ('')}
                aria-label="Clear filter"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-dim hover:text-term"
              >
                ✕
              </button>
            )}
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-dim">
            <span className="inline-block h-2 w-2 rounded-full bg-term" /> playable in TmuxLegends
          </span>
        </div>

        {/* Scrollable binding list */}
        {sections.length === 0 ? (
          <p className="px-5 py-10 text-center text-ink-dim">Nothing matches &ldquo;{q}&rdquo;.</p>
        ) : (
          <div className="grid gap-4 overflow-y-auto px-5 py-4 sm:grid-cols-2">
            {sections.map((s) => (
              <section
                key={s.title}
                className="rounded-xl border border-border bg-panel-2/40 p-4"
                style={{ borderTop: '2.5px solid var(--color-term)' }}
              >
                <div className="mb-2">
                  <h3 className="font-terminal text-lg font-semibold text-term">{s.title}</h3>
                  {s.blurb && <p className="text-xs text-ink-dim">{s.blurb}</p>}
                </div>
                <div className="space-y-1.5">
                  {s.rows.map((row) => (
                    <Row key={row.keys} row={row} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Download action */}
        <div className="flex flex-wrap items-center gap-2.5 border-t border-border px-5 py-3.5">
          <span className="mr-auto text-xs text-ink-dim">Take it with you:</span>
          <button
            onClick={() => {
              sfx.ui()
              downloadCheatsheetPdf()
              toast('Downloaded PDF ✓')
            }}
            className="btn-primary rounded-lg px-3.5 py-1.5 text-sm font-bold"
            title="Download the full cheatsheet as a PDF"
          >
            ↓ Download PDF
          </button>
        </div>

        {flash && (
          <p className="pointer-events-none absolute bottom-16 left-1/2 -translate-x-1/2 rounded-lg border border-term/50 bg-panel px-3 py-1.5 text-xs text-term shadow-lg">
            {flash}
          </p>
        )}
      </motion.div>
    </motion.div>,
    document.body,
  )
}

/** One binding. `sim` rows are playable here, and get the lit keycap treatment
 *  VimLegends gives a mastered command. */
function Row({ row }: { row: CheatRow }) {
  return (
    <div className="flex items-baseline gap-2.5">
      <span
        className={`keycap shrink-0 ${row.sim ? 'border-term text-term' : 'text-ink'}`}
        style={row.sim ? { boxShadow: '0 0 8px color-mix(in srgb, var(--color-term) 40%, transparent)' } : undefined}
      >
        {row.keys}
      </span>
      <span className="text-sm text-ink-dim">{row.desc}</span>
    </div>
  )
}
