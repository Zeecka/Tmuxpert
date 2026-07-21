/**
 * TmuxLegends's tmux state model - a pure, serializable multiplexer state tree.
 *
 * There is no "real tmux in the browser", so this is a faithful *simulation*:
 * sessions → windows → (a binary tree of) panes. Because it's pure data with
 * no DOM, the exact same reducer (engine.ts) drives both the live surface and
 * the headless par-proving tests. This is the analog of VimLegends's editor
 * buffer - here the "buffer" is the whole pane/window/session tree.
 */

/** A pane split. tmux's famously counter-intuitive naming:
 *  'h' = split-window -h = panes side-by-side (left | right, a vertical divider)
 *  'v' = split-window -v = panes stacked (top / bottom, a horizontal divider) */
export type SplitDir = 'h' | 'v'

/** A single terminal pane. `cmd` is the (fake) foreground program, e.g. 'vim',
 *  'htop', 'server'. `content` is optional visible text for copy-mode. */
export interface Pane {
  id: number
  cmd?: string
  content?: string[]
}

/** The pane arrangement of a window, as a binary tree. A leaf holds one pane;
 *  a split divides its area between two child layouts in direction `dir`. */
export type Layout =
  | { kind: 'pane'; pane: Pane }
  | { kind: 'split'; dir: SplitDir; ratio: number; a: Layout; b: Layout }

export interface Window {
  id: number
  name: string
  layout: Layout
  activePaneId: number
  /** When true the active pane is temporarily full-window (prefix z). */
  zoomed: boolean
}

export interface Session {
  id: number
  name: string
  windows: Window[]
  activeWindowId: number
  /** false once the client detaches (prefix d). */
  attached: boolean
}

export type Mode = 'normal' | 'prefix' | 'copy' | 'command' | 'rename-window' | 'rename-session'

export interface CopyState {
  paneId: number
  cursor: { row: number; col: number }
  /** Set once a selection is started (space/v). */
  anchor?: { row: number; col: number }
  /** Present (even as '') while a `/` search string is being typed. */
  search?: string
}

/** The whole multiplexer state. Everything a goal predicate can inspect. */
export interface TmuxState {
  sessions: Session[]
  activeSessionId: number
  mode: Mode
  /** Buffer for the ':' command prompt and the rename prompts. */
  commandBuf: string
  copy?: CopyState
  clipboard?: string
  /** Transient status/error line (e.g. "unknown command"). */
  status?: string
  nextPaneId: number
  nextWindowId: number
  nextSessionId: number
}

/** The prefix key. Real tmux default is C-b. */
export const PREFIX = { key: 'b', ctrl: true } as const

// ------------------------------------------------------------- accessors ---

export function activeSession(s: TmuxState): Session {
  return s.sessions.find((x) => x.id === s.activeSessionId) ?? s.sessions[0]
}

export function activeWindow(s: TmuxState): Window {
  const sess = activeSession(s)
  return sess.windows.find((w) => w.id === sess.activeWindowId) ?? sess.windows[0]
}

export function activePane(s: TmuxState): Pane {
  const w = activeWindow(s)
  return findPane(w.layout, w.activePaneId) ?? leaves(w.layout)[0]
}

/** In-order list of the panes in a layout (left→right / top→bottom). */
export function leaves(l: Layout): Pane[] {
  if (l.kind === 'pane') return [l.pane]
  return [...leaves(l.a), ...leaves(l.b)]
}

export function findPane(l: Layout, id: number): Pane | undefined {
  return leaves(l).find((p) => p.id === id)
}

export function paneCount(l: Layout): number {
  return leaves(l).length
}

/** Index (0-based) of a window in its session, i.e. what the status bar shows. */
export function windowIndex(sess: Session, windowId: number): number {
  return sess.windows.findIndex((w) => w.id === windowId)
}

// ------------------------------------------------------- immutable tree ops ---

/** Replace the leaf holding pane `id` with `fn(thatLeaf)`. Returns a new tree. */
export function mapLeaf(l: Layout, id: number, fn: (leaf: Extract<Layout, { kind: 'pane' }>) => Layout): Layout {
  if (l.kind === 'pane') return l.pane.id === id ? fn(l) : l
  return { ...l, a: mapLeaf(l.a, id, fn), b: mapLeaf(l.b, id, fn) }
}

/** Remove the leaf holding pane `id`, collapsing its parent split into the
 *  sibling. Returns null if the whole tree was a single matching leaf. */
export function removeLeaf(l: Layout, id: number): Layout | null {
  if (l.kind === 'pane') return l.pane.id === id ? null : l
  const a = removeLeaf(l.a, id)
  const b = removeLeaf(l.b, id)
  if (a === null) return b // sibling collapses up
  if (b === null) return a
  return { ...l, a, b }
}

/** Swap the pane objects sitting at two leaf positions in the tree. */
export function swapPanes(l: Layout, idA: number, idB: number): Layout {
  const pa = findPane(l, idA)
  const pb = findPane(l, idB)
  if (!pa || !pb) return l
  const put = (node: Layout): Layout => {
    if (node.kind === 'pane') {
      if (node.pane.id === idA) return { kind: 'pane', pane: pb }
      if (node.pane.id === idB) return { kind: 'pane', pane: pa }
      return node
    }
    return { ...node, a: put(node.a), b: put(node.b) }
  }
  return put(l)
}

// ----------------------------------------------------------- geometry ---

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

/** Assign every pane a normalized rectangle in [0,1]² (for directional
 *  pane selection with the arrow keys and for hit-testing). */
export function paneRects(l: Layout, rect: Rect = { x: 0, y: 0, w: 1, h: 1 }): Map<number, Rect> {
  const out = new Map<number, Rect>()
  const walk = (node: Layout, r: Rect) => {
    if (node.kind === 'pane') {
      out.set(node.pane.id, r)
      return
    }
    if (node.dir === 'h') {
      const wa = r.w * node.ratio
      walk(node.a, { ...r, w: wa })
      walk(node.b, { x: r.x + wa, y: r.y, w: r.w - wa, h: r.h })
    } else {
      const ha = r.h * node.ratio
      walk(node.a, { ...r, h: ha })
      walk(node.b, { x: r.x, y: r.y + ha, w: r.w, h: r.h - ha })
    }
  }
  walk(l, rect)
  return out
}

// --------------------------------------------------------- serialization ---

/** Stable structural string for a layout, ignoring ratios and pane ids:
 *  a leaf is '.', a split is `dir[ab]`. e.g. two side-by-side panes → "h[..]",
 *  an editor over a split terminal row → "v[.h[..]]". Used by `layoutIs` goals
 *  (the tmux analog of VimLegends's `targetText`). */
export function serializeLayout(l: Layout): string {
  if (l.kind === 'pane') return '.'
  return `${l.dir}[${serializeLayout(l.a)}${serializeLayout(l.b)}]`
}

// --------------------------------------------------------- construction ---

/** Build an even (balanced) layout of the given panes, all splits in `dir`.
 *  Used by the next-layout binding (prefix space). */
export function evenLayout(panes: Pane[], dir: SplitDir): Layout {
  if (panes.length === 1) return { kind: 'pane', pane: panes[0] }
  const mid = Math.ceil(panes.length / 2)
  return {
    kind: 'split',
    dir,
    ratio: mid / panes.length,
    a: evenLayout(panes.slice(0, mid), dir),
    b: evenLayout(panes.slice(mid), dir),
  }
}

/** Convenience: a fresh single-pane, single-window, single-session state.
 *  `sessionName`/`windowName`/`cmd` seed the starting scenario. */
export function makeState(opts?: { session?: string; window?: string; cmd?: string; content?: string[] }): TmuxState {
  const pane: Pane = { id: 1, cmd: opts?.cmd, content: opts?.content }
  const win: Window = {
    id: 1,
    name: opts?.window ?? 'zsh',
    layout: { kind: 'pane', pane },
    activePaneId: 1,
    zoomed: false,
  }
  const sess: Session = {
    id: 1,
    name: opts?.session ?? 'main',
    windows: [win],
    activeWindowId: 1,
    attached: true,
  }
  return {
    sessions: [sess],
    activeSessionId: 1,
    mode: 'normal',
    commandBuf: '',
    nextPaneId: 2,
    nextWindowId: 2,
    nextSessionId: 2,
  }
}

/** Deep-clone a state (structuredClone) - the reducer is pure, so content
 *  files can safely reuse a shared starting-state builder. */
export function cloneState(s: TmuxState): TmuxState {
  return structuredClone(s)
}
