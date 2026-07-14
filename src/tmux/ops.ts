/**
 * Semantic operations on TmuxState — the verbs both the keystroke grammar
 * (engine.ts) and the ':' command parser (commands.ts) are expressed in.
 * Every function is pure: (state, …) → new state. Kept separate from both
 * callers so there is no engine ⇄ commands import cycle.
 */
import {
  activePane,
  activeSession,
  activeWindow,
  evenLayout,
  findPane,
  leaves,
  mapLeaf,
  paneCount,
  paneRects,
  removeLeaf,
  swapPanes,
  windowIndex,
  type Pane,
  type Session,
  type SplitDir,
  type TmuxState,
  type Window,
} from './model'

// --------------------------------------------------------- small helpers ---

function updateActiveSession(s: TmuxState, sess: Session): TmuxState {
  return { ...s, sessions: s.sessions.map((x) => (x.id === sess.id ? sess : x)) }
}

function updateActiveWindow(s: TmuxState, fn: (w: Window) => Window): TmuxState {
  const sess = activeSession(s)
  const windows = sess.windows.map((w) => (w.id === sess.activeWindowId ? fn(w) : w))
  return updateActiveSession(s, { ...sess, windows })
}

// ------------------------------------------------------------------ panes ---

export function splitActive(s: TmuxState, dir: SplitDir, cmd?: string): TmuxState {
  const w = activeWindow(s)
  const newPane: Pane = { id: s.nextPaneId, cmd }
  const layout = mapLeaf(w.layout, w.activePaneId, (leaf) => ({
    kind: 'split',
    dir,
    ratio: 0.5,
    a: leaf,
    b: { kind: 'pane', pane: newPane },
  }))
  const s2 = updateActiveWindow(s, (win) => ({ ...win, layout, activePaneId: newPane.id, zoomed: false }))
  return { ...s2, nextPaneId: s.nextPaneId + 1 }
}

export function killPane(s: TmuxState): TmuxState {
  const w = activeWindow(s)
  if (paneCount(w.layout) <= 1) return killWindow(s) // last pane closes the window
  const remaining = removeLeaf(w.layout, w.activePaneId)!
  const newActive = leaves(remaining)[0].id
  return updateActiveWindow(s, (win) => ({ ...win, layout: remaining, activePaneId: newActive, zoomed: false }))
}

export function toggleZoom(s: TmuxState): TmuxState {
  const w = activeWindow(s)
  if (paneCount(w.layout) <= 1) return s
  return updateActiveWindow(s, (win) => ({ ...win, zoomed: !win.zoomed }))
}

export function selectPaneCycle(s: TmuxState): TmuxState {
  const w = activeWindow(s)
  const ids = leaves(w.layout).map((p) => p.id)
  const i = ids.indexOf(w.activePaneId)
  const next = ids[(i + 1) % ids.length]
  return updateActiveWindow(s, (win) => ({ ...win, activePaneId: next, zoomed: false }))
}

export type PaneDir = 'L' | 'R' | 'U' | 'D'

export function selectPaneDir(s: TmuxState, dir: PaneDir): TmuxState {
  const w = activeWindow(s)
  const rects = paneRects(w.layout)
  const cur = rects.get(w.activePaneId)
  if (!cur) return s
  const cx = cur.x + cur.w / 2
  const cy = cur.y + cur.h / 2
  let best = -1
  let bestDist = Infinity
  for (const [id, r] of rects) {
    if (id === w.activePaneId) continue
    const dx = r.x + r.w / 2 - cx
    const dy = r.y + r.h / 2 - cy
    const ok =
      dir === 'L' ? dx < -1e-6 && Math.abs(dy) <= Math.abs(dx)
      : dir === 'R' ? dx > 1e-6 && Math.abs(dy) <= Math.abs(dx)
      : dir === 'U' ? dy < -1e-6 && Math.abs(dx) <= Math.abs(dy)
      : dy > 1e-6 && Math.abs(dx) <= Math.abs(dy)
    if (!ok) continue
    const dist = dx * dx + dy * dy
    if (dist < bestDist) {
      bestDist = dist
      best = id
    }
  }
  if (best < 0) return s
  return updateActiveWindow(s, (win) => ({ ...win, activePaneId: best, zoomed: false }))
}

export function swapPaneCycle(s: TmuxState, delta: -1 | 1): TmuxState {
  const w = activeWindow(s)
  const ids = leaves(w.layout).map((p) => p.id)
  if (ids.length < 2) return s
  const i = ids.indexOf(w.activePaneId)
  const j = (i + delta + ids.length) % ids.length
  const layout = swapPanes(w.layout, ids[i], ids[j])
  return updateActiveWindow(s, (win) => ({ ...win, layout }))
}

export function breakPane(s: TmuxState): TmuxState {
  const w = activeWindow(s)
  if (paneCount(w.layout) <= 1) return s
  const pane = findPane(w.layout, w.activePaneId)!
  const remaining = removeLeaf(w.layout, w.activePaneId)!
  const newActiveInOld = leaves(remaining)[0].id
  const s2 = updateActiveWindow(s, (win) => ({ ...win, layout: remaining, activePaneId: newActiveInOld, zoomed: false }))
  const sess = activeSession(s2)
  const newWin: Window = {
    id: s2.nextWindowId,
    name: pane.cmd ?? 'zsh',
    layout: { kind: 'pane', pane },
    activePaneId: pane.id,
    zoomed: false,
  }
  const sess2 = { ...sess, windows: [...sess.windows, newWin], activeWindowId: newWin.id }
  return { ...updateActiveSession(s2, sess2), nextWindowId: s2.nextWindowId + 1 }
}

export function nextLayout(s: TmuxState): TmuxState {
  const w = activeWindow(s)
  if (w.layout.kind === 'pane') return s
  const nextDir: SplitDir = w.layout.dir === 'h' ? 'v' : 'h'
  const layout = evenLayout(leaves(w.layout), nextDir)
  return updateActiveWindow(s, (win) => ({ ...win, layout }))
}

/** Nudge the nearest matching-direction ancestor split of the active pane.
 *  Approximate (MVP) — enough to teach resize-pane; no tier-1–3 goal depends
 *  on exact ratios. */
export function resizeActive(s: TmuxState, dir: PaneDir, amount = 0.08): TmuxState {
  const w = activeWindow(s)
  const wantDir: SplitDir = dir === 'L' || dir === 'R' ? 'h' : 'v'
  let done = false
  const walk = (node: import('./model').Layout): { layout: import('./model').Layout; has: boolean } => {
    if (node.kind === 'pane') return { layout: node, has: node.pane.id === w.activePaneId }
    const a = walk(node.a)
    const b = walk(node.b)
    let ratio = node.ratio
    if (!done && node.dir === wantDir && (a.has || b.has)) {
      const grow = dir === 'R' || dir === 'D'
      // active in `a` (left/top): grow => bigger ratio; in `b`: grow => smaller
      const sign = a.has ? (grow ? 1 : -1) : grow ? -1 : 1
      ratio = Math.min(0.85, Math.max(0.15, ratio + sign * amount))
      done = true
    }
    return { layout: { ...node, ratio, a: a.layout, b: b.layout }, has: a.has || b.has }
  }
  const layout = walk(w.layout).layout
  return updateActiveWindow(s, (win) => ({ ...win, layout }))
}

export function paste(s: TmuxState): TmuxState {
  if (!s.clipboard) return s
  const p = activePane(s)
  const add = s.clipboard.split('\n')
  const w = activeWindow(s)
  const layout = mapLeaf(w.layout, p.id, (leaf) => ({
    kind: 'pane',
    pane: { ...leaf.pane, content: [...(leaf.pane.content ?? []), ...add] },
  }))
  return updateActiveWindow(s, (win) => ({ ...win, layout }))
}

// ---------------------------------------------------------------- windows ---

export function newWindow(s: TmuxState, name?: string, cmd?: string): TmuxState {
  const sess = activeSession(s)
  const pane: Pane = { id: s.nextPaneId, cmd }
  const win: Window = {
    id: s.nextWindowId,
    name: name ?? cmd ?? 'zsh',
    layout: { kind: 'pane', pane },
    activePaneId: pane.id,
    zoomed: false,
  }
  const sess2 = { ...sess, windows: [...sess.windows, win], activeWindowId: win.id }
  return { ...updateActiveSession(s, sess2), nextPaneId: s.nextPaneId + 1, nextWindowId: s.nextWindowId + 1 }
}

export function killWindow(s: TmuxState): TmuxState {
  const sess = activeSession(s)
  if (sess.windows.length <= 1) return s // last window would kill the session
  const idx = windowIndex(sess, sess.activeWindowId)
  const windows = sess.windows.filter((w) => w.id !== sess.activeWindowId)
  const newActive = windows[Math.min(idx, windows.length - 1)].id
  return updateActiveSession(s, { ...sess, windows, activeWindowId: newActive })
}

export function selectWindowStep(s: TmuxState, delta: -1 | 1): TmuxState {
  const sess = activeSession(s)
  const i = windowIndex(sess, sess.activeWindowId)
  const j = (i + delta + sess.windows.length) % sess.windows.length
  return updateActiveSession(s, { ...sess, activeWindowId: sess.windows[j].id })
}

export function selectWindowIndex(s: TmuxState, index: number): TmuxState {
  const sess = activeSession(s)
  const win = sess.windows[index]
  if (!win) return s
  return updateActiveSession(s, { ...sess, activeWindowId: win.id })
}

export function renameWindow(s: TmuxState, name: string): TmuxState {
  return updateActiveWindow(s, (w) => ({ ...w, name }))
}

export function swapWindowWith(s: TmuxState, index: number): TmuxState {
  const sess = activeSession(s)
  const i = windowIndex(sess, sess.activeWindowId)
  if (index < 0 || index >= sess.windows.length || index === i) return s
  const windows = sess.windows.slice()
  ;[windows[i], windows[index]] = [windows[index], windows[i]]
  return updateActiveSession(s, { ...sess, windows })
}

// --------------------------------------------------------------- sessions ---

export function detach(s: TmuxState): TmuxState {
  const sess = activeSession(s)
  return updateActiveSession(s, { ...sess, attached: false })
}

export function renameSession(s: TmuxState, name: string): TmuxState {
  const sess = activeSession(s)
  return updateActiveSession(s, { ...sess, name })
}

export function newSession(s: TmuxState, name?: string): TmuxState {
  const pane: Pane = { id: s.nextPaneId }
  const win: Window = {
    id: s.nextWindowId,
    name: 'zsh',
    layout: { kind: 'pane', pane },
    activePaneId: pane.id,
    zoomed: false,
  }
  const sess: Session = {
    id: s.nextSessionId,
    name: name ?? String(s.nextSessionId),
    windows: [win],
    activeWindowId: win.id,
    attached: false, // :new-session creates it detached; you don't switch to it
  }
  return {
    ...s,
    sessions: [...s.sessions, sess],
    nextPaneId: s.nextPaneId + 1,
    nextWindowId: s.nextWindowId + 1,
    nextSessionId: s.nextSessionId + 1,
  }
}

// -------------------------------------------------------------- copy mode ---

function paneById(s: TmuxState, id: number): Pane | undefined {
  for (const sess of s.sessions) for (const w of sess.windows) {
    const p = findPane(w.layout, id)
    if (p) return p
  }
  return undefined
}

function copyLines(s: TmuxState): string[] {
  const p = s.copy ? paneById(s, s.copy.paneId) : undefined
  return p?.content ?? ['']
}

export function enterCopyMode(s: TmuxState): TmuxState {
  const p = activePane(s)
  const lines = p.content ?? ['']
  return { ...s, mode: 'copy', copy: { paneId: p.id, cursor: { row: Math.max(0, lines.length - 1), col: 0 } } }
}

export function copyMove(s: TmuxState, dRow: number, dCol: number): TmuxState {
  if (!s.copy) return s
  const lines = copyLines(s)
  const row = Math.min(lines.length - 1, Math.max(0, s.copy.cursor.row + dRow))
  const col = Math.min(Math.max(0, lines[row].length - 1), Math.max(0, s.copy.cursor.col + dCol))
  return { ...s, copy: { ...s.copy, cursor: { row, col } } }
}

export function copyToLineEdge(s: TmuxState, edge: 'start' | 'end'): TmuxState {
  if (!s.copy) return s
  const lines = copyLines(s)
  const row = s.copy.cursor.row
  const col = edge === 'start' ? 0 : Math.max(0, lines[row].length - 1)
  return { ...s, copy: { ...s.copy, cursor: { row, col } } }
}

export function copySetAnchor(s: TmuxState): TmuxState {
  if (!s.copy) return s
  return { ...s, copy: { ...s.copy, anchor: { ...s.copy.cursor } } }
}

function selectionText(lines: string[], a: { row: number; col: number }, b: { row: number; col: number }): string {
  let lo = a
  let hi = b
  if (lo.row > hi.row || (lo.row === hi.row && lo.col > hi.col)) [lo, hi] = [hi, lo]
  if (lo.row === hi.row) return lines[lo.row].slice(lo.col, hi.col + 1)
  const out = [lines[lo.row].slice(lo.col)]
  for (let r = lo.row + 1; r < hi.row; r++) out.push(lines[r])
  out.push(lines[hi.row].slice(0, hi.col + 1))
  return out.join('\n')
}

export function copyYank(s: TmuxState): TmuxState {
  if (!s.copy) return s
  const lines = copyLines(s)
  const anchor = s.copy.anchor ?? s.copy.cursor
  const text = selectionText(lines, anchor, s.copy.cursor)
  return { ...s, mode: 'normal', copy: undefined, clipboard: text }
}

export function exitCopyMode(s: TmuxState): TmuxState {
  return { ...s, mode: 'normal', copy: undefined }
}

export function copySearchStart(s: TmuxState): TmuxState {
  if (!s.copy) return s
  return { ...s, copy: { ...s.copy, search: '' } }
}

export function copySearchInput(s: TmuxState, edit: (cur: string) => string): TmuxState {
  if (!s.copy || s.copy.search === undefined) return s
  return { ...s, copy: { ...s.copy, search: edit(s.copy.search) } }
}

export function copySearchCommit(s: TmuxState): TmuxState {
  if (!s.copy || s.copy.search === undefined) return s
  const term = s.copy.search
  const { search: _drop, ...rest } = s.copy
  void _drop
  if (!term) return { ...s, copy: rest }
  const lines = copyLines(s)
  const start = s.copy.cursor.row
  const n = lines.length
  // search downward first (like tmux `/`), wrapping around
  for (let k = 1; k <= n; k++) {
    const row = (start + k) % n
    const col = lines[row].indexOf(term)
    if (col >= 0) return { ...s, copy: { ...rest, cursor: { row, col } } }
  }
  return { ...s, copy: rest }
}

export function copySearchCancel(s: TmuxState): TmuxState {
  if (!s.copy) return s
  const { search: _drop, ...rest } = s.copy
  void _drop
  return { ...s, copy: rest }
}
