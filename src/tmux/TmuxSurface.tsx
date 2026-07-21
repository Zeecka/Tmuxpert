import { forwardRef, useEffect, useImperativeHandle, useReducer, useRef, useState } from 'react'
import { MODIFIER_KEYS, isPrefix, keyFromEvent, reduce } from './engine'
import {
  activeSession,
  activeWindow,
  cloneState,
  leaves,
  windowIndex,
  type CopyState,
  type Layout,
  type Mode,
  type Pane,
  type TmuxState,
} from './model'
import { checkGoal } from '../game/runtime'
import { stagesOf, type Challenge } from '../game/types'
import { sfx } from '../game/sound'

interface Props {
  challenge: Challenge
  onComplete: (keystrokes: number) => void
  onKeystroke?: (count: number) => void
  onModeChange?: (mode: Mode) => void
  onStageAdvance?: (stage: number) => void
  onFail?: (keystrokes: number) => void
  frozen?: boolean
}

export interface TmuxSurfaceHandle {
  focus: () => void
}

const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', '/'])

// After the goal is met, hold on the final tmux state for a beat so the player
// actually SEES what they did (the new split, the zoom, the detach...) before the
// result card slides over it.
const WIN_REVEAL_MS = 650
const FAIL_REVEAL_MS = 500

/**
 * The interactive tmux surface - the analog of VimLegends's VimEditor. Holds the
 * pure engine state, counts keystrokes (VimGolf-style, capture phase so nothing
 * escapes), advances ratcheted boss stages, enforces the boss budget, and renders
 * the pane tree + status bar. Remount (via a `key` on the parent) per challenge.
 */
const TmuxSurface = forwardRef<TmuxSurfaceHandle, Props>(function TmuxSurface(
  { challenge, onComplete, onKeystroke, onModeChange, onStageAdvance, onFail, frozen },
  ref,
) {
  const hostRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef<TmuxState>(cloneState(challenge.start))
  const keystrokes = useRef(0)
  const done = useRef(false)
  const stageIdx = useRef(0)
  const [, forceRender] = useReducer((x) => x + 1, 0)
  const [outcomeFlash, setOutcomeFlash] = useState<'win' | 'fail' | null>(null)
  const revealTimer = useRef<number | undefined>(undefined)
  const frozenRef = useRef(frozen)
  frozenRef.current = frozen

  useImperativeHandle(ref, () => ({ focus: () => hostRef.current?.focus() }), [])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const stages = stagesOf(challenge)
    const budget = challenge.keystrokeBudget

    const runGoalCheck = (st: TmuxState) => {
      if (done.current) return
      if (keystrokes.current === 0) return // never judge the pristine start state
      let advanced = false
      while (stageIdx.current < stages.length && checkGoal(st, stages[stageIdx.current].goal)) {
        stageIdx.current += 1
        advanced = true
      }
      if (stageIdx.current >= stages.length) {
        done.current = true
        sfx.success()
        setOutcomeFlash('win')
        // Let the final state linger before the result card covers the surface.
        revealTimer.current = window.setTimeout(() => onComplete(keystrokes.current), WIN_REVEAL_MS)
        return
      }
      if (advanced) {
        sfx.combo(stageIdx.current + 1)
        onStageAdvance?.(stageIdx.current)
      }
      // Budget checked AFTER goals: a winning key at exactly the limit still wins.
      if (budget !== undefined && keystrokes.current > budget) {
        done.current = true
        sfx.error()
        setOutcomeFlash('fail')
        revealTimer.current = window.setTimeout(() => onFail?.(keystrokes.current), FAIL_REVEAL_MS)
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (done.current || frozenRef.current) return
      if (MODIFIER_KEYS.has(e.key)) return
      const k = keyFromEvent(e)
      // Capture the keys the surface acts on so the browser doesn't scroll /
      // quick-find / trigger its own shortcuts while you play.
      if (stateRef.current.mode !== 'normal' || isPrefix(k) || SCROLL_KEYS.has(e.key)) e.preventDefault()

      keystrokes.current += 1
      onKeystroke?.(keystrokes.current)
      sfx.key()

      const next = reduce(stateRef.current, k)
      stateRef.current = next
      forceRender()
      onModeChange?.(next.mode)
      runGoalCheck(next)
    }

    host.addEventListener('keydown', onKeyDown, true)
    host.focus()
    onModeChange?.(stateRef.current.mode)

    return () => {
      host.removeEventListener('keydown', onKeyDown, true)
      window.clearTimeout(revealTimer.current)
    }
    // Remount on challenge change via key; deps intentionally exclude callbacks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge])

  const flashRing =
    outcomeFlash === 'win'
      ? 'rounded-lg ring-2 ring-term transition-shadow'
      : outcomeFlash === 'fail'
        ? 'rounded-lg ring-2 ring-danger transition-shadow'
        : ''

  return (
    <div
      ref={hostRef}
      tabIndex={0}
      className={`flex h-full w-full flex-col gap-2 p-2 font-mono outline-none select-none ${flashRing}`}
    >
      <SurfaceBody state={stateRef.current} />
    </div>
  )
})

export default TmuxSurface

// ------------------------------------------------------------- rendering ---

function SurfaceBody({ state }: { state: TmuxState }) {
  const sess = activeSession(state)
  const win = activeWindow(state)
  return (
    <>
      <div className="relative min-h-0 flex-1">
        {!sess.attached ? (
          <DetachedView name={sess.name} />
        ) : win.zoomed ? (
          <PaneBox pane={leaves(win.layout).find((p) => p.id === win.activePaneId)!} active zoomed state={state} />
        ) : (
          <LayoutView layout={win.layout} activePaneId={win.activePaneId} state={state} />
        )}
      </div>
      <StatusBar state={state} />
    </>
  )
}

function LayoutView({ layout, activePaneId, state }: { layout: Layout; activePaneId: number; state: TmuxState }) {
  if (layout.kind === 'pane') {
    return <PaneBox pane={layout.pane} active={layout.pane.id === activePaneId} state={state} />
  }
  const aFlex = layout.ratio
  const bFlex = 1 - layout.ratio
  return (
    <div className={`flex h-full w-full gap-1.5 ${layout.dir === 'h' ? 'flex-row' : 'flex-col'}`}>
      <div style={{ flexGrow: aFlex, flexBasis: 0 }} className="min-h-0 min-w-0">
        <LayoutView layout={layout.a} activePaneId={activePaneId} state={state} />
      </div>
      <div style={{ flexGrow: bFlex, flexBasis: 0 }} className="min-h-0 min-w-0">
        <LayoutView layout={layout.b} activePaneId={activePaneId} state={state} />
      </div>
    </div>
  )
}

function PaneBox({ pane, active, zoomed, state }: { pane: Pane; active: boolean; zoomed?: boolean; state: TmuxState }) {
  const inCopy = active && state.mode === 'copy' && state.copy?.paneId === pane.id
  return (
    <div
      className={`flex h-full w-full flex-col overflow-hidden rounded-md border bg-black/40 ${
        active ? 'border-term shadow-[0_0_0_1px_var(--color-term)]' : 'border-border'
      }`}
    >
      <div className="flex items-center justify-between border-b border-border/50 px-2 py-0.5 text-[11px] text-ink-dim">
        <span className="truncate">{pane.cmd ?? 'zsh'}</span>
        {zoomed && <span className="font-bold text-term">ZOOM</span>}
      </div>
      <div className="min-h-0 flex-1 overflow-hidden p-2 text-[12px] leading-snug">
        <PaneBody pane={pane} active={active} inCopy={inCopy} copy={state.copy} mode={state.mode} />
      </div>
    </div>
  )
}

function PaneBody({
  pane,
  active,
  inCopy,
  copy,
  mode,
}: {
  pane: Pane
  active: boolean
  inCopy: boolean
  copy?: CopyState
  mode: Mode
}) {
  if (pane.content && pane.content.length) {
    return (
      <div className="whitespace-pre text-ink/90">
        {pane.content.map((line, r) => (
          <div key={r}>{inCopy && copy ? renderCopyLine(line, r, copy) : line || ' '}</div>
        ))}
        {inCopy && <div className="mt-1 text-[11px] font-bold text-cyan">{copy?.search !== undefined ? `/${copy.search}` : '-- COPY --'}</div>}
      </div>
    )
  }
  return (
    <div className="text-ink/80">
      <span className="text-term">~</span> $ {pane.cmd ? <span className="text-ink-dim">{pane.cmd}</span> : null}
      {active && mode === 'normal' && <span className="ml-0.5 inline-block h-[1em] w-[0.5em] translate-y-[0.15em] bg-term align-middle tx-anim" style={{ animation: 'tx-blink 1s step-end infinite' }} />}
    </div>
  )
}

/** Render one copy-mode line with the cursor cell (and selection) highlighted. */
function renderCopyLine(line: string, row: number, copy: CopyState) {
  const text = line.length ? line : ' '
  if (copy.cursor.row !== row && (!copy.anchor || !inSelectedRow(row, copy))) {
    return text
  }
  const chars = [...text]
  return (
    <span>
      {chars.map((ch, col) => {
        const isCursor = copy.cursor.row === row && copy.cursor.col === col
        const selected = copy.anchor ? inSelection(row, col, copy) : false
        return (
          <span
            key={col}
            className={isCursor ? 'bg-term text-black' : selected ? 'bg-term/30 text-ink' : undefined}
          >
            {ch}
          </span>
        )
      })}
    </span>
  )
}

function inSelectedRow(row: number, copy: CopyState): boolean {
  if (!copy.anchor) return false
  const lo = Math.min(copy.anchor.row, copy.cursor.row)
  const hi = Math.max(copy.anchor.row, copy.cursor.row)
  return row >= lo && row <= hi
}

function inSelection(row: number, col: number, copy: CopyState): boolean {
  if (!copy.anchor) return false
  let lo = copy.anchor
  let hi = copy.cursor
  if (lo.row > hi.row || (lo.row === hi.row && lo.col > hi.col)) [lo, hi] = [hi, lo]
  if (row < lo.row || row > hi.row) return false
  if (row === lo.row && col < lo.col) return false
  if (row === hi.row && col > hi.col) return false
  return true
}

function DetachedView({ name }: { name: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-md border border-border bg-black/40 text-center">
      <div className="text-sm text-ink-dim">[detached]</div>
      <div className="mt-1 text-xs text-ink-dim">
        session <span className="text-term">{name}</span> is still running in the background
      </div>
      <div className="mt-3 text-[11px] text-ink-dim/70">$ tmux attach -t {name}</div>
    </div>
  )
}

function StatusBar({ state }: { state: TmuxState }) {
  const sess = activeSession(state)
  const activeIdx = windowIndex(sess, sess.activeWindowId)

  // In prompt-like modes tmux turns the status line into the prompt.
  if (state.mode === 'command') return <PromptBar prefix=":" value={state.commandBuf} />
  if (state.mode === 'rename-window') return <PromptBar prefix="(rename-window) " value={state.commandBuf} />
  if (state.mode === 'rename-session') return <PromptBar prefix="(rename-session) " value={state.commandBuf} />

  return (
    <div className="flex items-center justify-between rounded-md bg-term px-3 py-1 text-[12px] font-bold text-black">
      <div className="flex min-w-0 items-center gap-3">
        <span className="rounded bg-black/25 px-1.5 py-0.5">[{sess.name}]</span>
        <span className="flex min-w-0 gap-2 overflow-hidden">
          {sess.windows.map((w, i) => (
            <span key={w.id} className={i === activeIdx ? 'text-black' : 'text-black/50'}>
              {i}:{w.name}
              {i === activeIdx ? '*' : ''}
            </span>
          ))}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {state.mode === 'prefix' && <span className="rounded bg-black px-1.5 py-0.5 text-term">PREFIX ^B</span>}
        {state.mode === 'copy' && <span className="rounded bg-black px-1.5 py-0.5 text-cyan">COPY</span>}
        <span className="text-black/60">{'·'} tmuxlegends</span>
      </div>
    </div>
  )
}

function PromptBar({ prefix, value }: { prefix: string; value: string }) {
  return (
    <div className="flex items-center rounded-md bg-amber px-3 py-1 text-[12px] font-bold text-black">
      <span className="whitespace-pre">{prefix}{value}</span>
      <span className="ml-0.5 inline-block h-[1em] w-[0.5em] bg-black" style={{ animation: 'tx-blink 1s step-end infinite' }} />
    </div>
  )
}
