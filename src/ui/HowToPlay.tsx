import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { CheatsheetButton } from './Cheatsheet'
import { Emoji } from './Emoji'

/**
 * A 60-second primer for players who've never opened tmux — the one thing the
 * app was missing before you're dropped into a live multiplexer. Lazy-loaded
 * (default export) so it never weighs on the sync bundle. Auto-shown once to
 * brand-new players (see App's Home), and always reachable from the Home button.
 * Mirrors VimLegends's primer.
 *
 * Portalled to <body>: it auto-shows while <motion.main> is still animating its
 * transform, and a transformed ancestor is a containing block for `fixed`
 * descendants — so without this the primer would be offset on first paint.
 */
export default function HowToPlay({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null)
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

  const steps = [
    {
      k: 'Everything starts with the prefix',
      body: (
        <>
          tmux listens for one key combo — the <b className="text-term">prefix</b>, <Key>Ctrl</Key>+<Key>b</Key> by
          default. Press it, <i>release</i>, then press the command key. So &ldquo;split the pane&rdquo; is{' '}
          <Key>C-b</Key> then <Key>%</Key> — never held together. The badge above the surface shows when tmux is waiting
          for that second key.
        </>
      ),
    },
    {
      k: 'Panes, windows, sessions',
      body: (
        <>
          A <b className="text-term">pane</b> is a split of the screen, a <b className="text-cyan">window</b> is a tab
          holding panes, and a <b className="text-magenta">session</b> holds windows. Detach a session with{' '}
          <Key>C-b</Key> <Key>d</Key> and everything keeps running — that&rsquo;s tmux&rsquo;s superpower.
        </>
      ),
    },
    {
      k: 'Every keystroke counts',
      body: (
        <>
          Each level has a <b>task</b> and a <b className="text-amber">goal</b> — the fewest keystrokes a pro would use.
          Match or beat the goal for <span className="text-amber">⭐⭐⭐</span>. It&rsquo;s golf: think, don&rsquo;t mash.
        </>
      ),
    },
    {
      k: 'Never stuck',
      body: (
        <>
          Below the surface: <b>Need a hint?</b> spells out the move, <b>Cheatsheet</b> lists every binding, and{' '}
          <b>Restart</b> resets the level if you tangle it up. You can&rsquo;t break anything.
        </>
      ),
    },
  ]

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
        aria-label="How to play TmuxLegends"
        className="panel flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden outline-none"
        initial={{ scale: 0.94, y: 14, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <Emoji name="keyboard" size={20} />
            <h2 className="font-terminal text-xl font-bold text-term">How to play</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full border border-border px-2.5 py-1 text-sm text-ink-dim transition-colors hover:border-danger hover:text-danger"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto px-5 py-4">
          <p className="text-sm text-ink-dim">
            TmuxLegends teaches tmux in a <b className="text-ink">simulated multiplexer</b> — the keys transfer straight to
            your terminal, with nothing to install and no config to memorize. Sixty seconds and you&rsquo;re playing:
          </p>
          {steps.map((s, i) => (
            <div key={s.k} className="flex gap-3 rounded-xl border border-border bg-panel-2/40 p-3.5">
              <span
                className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold text-bg"
                style={{ background: 'var(--color-term)' }}
                aria-hidden
              >
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{s.k}</p>
                <p className="mt-0.5 text-sm text-ink-dim">{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 border-t border-border px-5 py-3.5">
          <CheatsheetButton
            label="Cheatsheet"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-1.5 text-sm text-ink-dim transition-colors hover:border-magenta hover:text-magenta"
          />
          <button onClick={onClose} className="btn-primary ml-auto rounded-lg px-4 py-1.5 text-sm font-bold">
            Let&rsquo;s go →
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  )
}

function Key({ children }: { children: ReactNode }) {
  return <span className="keycap">{children}</span>
}
