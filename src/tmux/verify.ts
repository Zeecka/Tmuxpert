/**
 * Composable goal checkers for challenge authoring (the tmux analog of
 * Vimersion's src/game/verify.ts). Content files import these instead of
 * writing ad-hoc predicate logic — keeps challenges declarative
 * (content-as-data). All checkers are pure factories returning a GoalPredicate;
 * combine with allOf/anyOf/not.
 */
import {
  activeSession,
  activeWindow,
  leaves,
  paneCount as layoutPaneCount,
  serializeLayout,
  windowIndex,
  type Mode,
  type SplitDir,
  type TmuxState,
} from './model'

export type GoalPredicate = (s: TmuxState) => boolean

// ------------------------------------------------------------ panes ---

/** Number of panes in the active window. */
export const paneCount = (n: number): GoalPredicate => (s) => layoutPaneCount(activeWindow(s).layout) === n

/** Exact structural layout of the active window (see serializeLayout). */
export const layoutIs = (str: string): GoalPredicate => (s) => serializeLayout(activeWindow(s).layout) === str

/** The active window's top-level split runs in this direction (⇒ 2 panes
 *  side-by-side for 'h', stacked for 'v'). */
export const splitDirIs = (dir: SplitDir): GoalPredicate => (s) => {
  const l = activeWindow(s).layout
  return l.kind === 'split' && l.dir === dir
}

export const activePaneCmd = (cmd: string): GoalPredicate => (s) => {
  const w = activeWindow(s)
  return leaves(w.layout).find((p) => p.id === w.activePaneId)?.cmd === cmd
}

/** Some pane in the active window runs `cmd`. */
export const anyPaneCmd = (cmd: string): GoalPredicate => (s) => leaves(activeWindow(s).layout).some((p) => p.cmd === cmd)

/** The leftmost/topmost pane in the active window runs `cmd` (for swap goals). */
export const firstPaneCmd = (cmd: string): GoalPredicate => (s) => leaves(activeWindow(s).layout)[0]?.cmd === cmd

export const paneZoomed = (): GoalPredicate => (s) => activeWindow(s).zoomed

// ------------------------------------------------------------ windows ---

export const windowCount = (n: number): GoalPredicate => (s) => activeSession(s).windows.length === n

/** A window with this name exists in the active session. */
export const windowNamed = (name: string): GoalPredicate => (s) => activeSession(s).windows.some((w) => w.name === name)

export const activeWindowNamed = (name: string): GoalPredicate => (s) => activeWindow(s).name === name

export const activeWindowIndex = (i: number): GoalPredicate => (s) => {
  const sess = activeSession(s)
  return windowIndex(sess, sess.activeWindowId) === i
}

// ------------------------------------------------------------ sessions ---

export const sessionCount = (n: number): GoalPredicate => (s) => s.sessions.length === n

export const sessionNamed = (name: string): GoalPredicate => (s) => s.sessions.some((x) => x.name === name)

export const activeSessionNamed = (name: string): GoalPredicate => (s) => activeSession(s).name === name

/** The named session (or the active one) is detached. */
export const sessionDetached = (name?: string): GoalPredicate => (s) => {
  const sess = name ? s.sessions.find((x) => x.name === name) : activeSession(s)
  return sess ? !sess.attached : false
}

// --------------------------------------------------------- copy / clipboard ---

export const inMode = (mode: Mode): GoalPredicate => (s) => s.mode === mode

export const clipboardEquals = (text: string): GoalPredicate => (s) => s.clipboard === text

export const clipboardContains = (text: string): GoalPredicate => (s) => (s.clipboard ?? '').includes(text)

// ------------------------------------------------------------ combinators ---

export const allOf = (...ps: GoalPredicate[]): GoalPredicate => (s) => ps.every((p) => p(s))

export const anyOf = (...ps: GoalPredicate[]): GoalPredicate => (s) => ps.some((p) => p(s))

export const not = (p: GoalPredicate): GoalPredicate => (s) => !p(s)
