/**
 * The tmux keystroke grammar - a pure reducer `reduce(state, key)`.
 *
 * Mirrors real tmux's modal, prefix-driven input model:
 *   normal  - keys go to the shell; only the prefix (C-b) is meaningful
 *   prefix  - the next key is a tmux binding, then back to normal
 *   command - the ':' command prompt (see commands.ts)
 *   copy    - copy-mode navigation / selection / search
 *   rename-window / rename-session - a text prompt
 *
 * No DOM here: the same reducer drives the live surface and the headless
 * par-proving tests. This is the analog of VimLegends's real vim keymap.
 */
import { PREFIX, type Mode, type TmuxState } from './model'
import { runCommand } from './commands'
import {
  breakPane,
  copyMove,
  copySearchCancel,
  copySearchCommit,
  copySearchInput,
  copySearchStart,
  copySetAnchor,
  copyToLineEdge,
  copyYank,
  detach,
  enterCopyMode,
  exitCopyMode,
  killPane,
  killWindow,
  newWindow,
  nextLayout,
  paste,
  renameSession,
  renameWindow,
  selectPaneCycle,
  selectPaneDir,
  selectWindowIndex,
  selectWindowStep,
  splitActive,
  swapPaneCycle,
  toggleZoom,
} from './ops'

// Split helpers keep the famously-confusing tmux naming in one obvious place.
const splitH = (s: TmuxState) => splitActive(s, 'h') // prefix % → left | right
const splitV = (s: TmuxState) => splitActive(s, 'v') // prefix " → top / bottom

/** A normalized key press. Produced from a DOM KeyboardEvent (surface) or a
 *  token string (test driver). `key` is the logical key: a character like
 *  '%' / 'b' / ' ', or a name like 'Enter' / 'Escape' / 'ArrowLeft'. */
export interface Key {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
}

export function isPrefix(k: Key): boolean {
  return !!k.ctrl && !k.alt && k.key.toLowerCase() === PREFIX.key
}

function isPrintable(k: Key): boolean {
  return k.key.length === 1 && !k.ctrl && !k.alt
}

const NORMAL: Mode = 'normal'

export function reduce(state: TmuxState, k: Key): TmuxState {
  switch (state.mode) {
    case 'normal':
      return isPrefix(k) ? { ...state, mode: 'prefix', status: undefined } : state
    case 'prefix':
      return reducePrefix(state, k)
    case 'command':
      return reduceCommand(state, k)
    case 'rename-window':
    case 'rename-session':
      return reduceRename(state, k)
    case 'copy':
      return reduceCopy(state, k)
  }
}

/** Fold a whole sequence of keys through the reducer. */
export function run(state: TmuxState, keys: Key[]): TmuxState {
  return keys.reduce(reduce, state)
}

function reducePrefix(s: TmuxState, k: Key): TmuxState {
  const base: TmuxState = { ...s, status: undefined }
  const norm = (ns: TmuxState): TmuxState => ({ ...ns, mode: NORMAL })
  // A second prefix (C-b C-b) sends a literal C-b to the pane - a no-op here.
  if (isPrefix(k)) return norm(base)
  switch (k.key) {
    case '%':
      return norm(splitH(base))
    case '"':
      return norm(splitV(base))
    case 'o':
      return norm(selectPaneCycle(base))
    case 'ArrowLeft':
      return norm(selectPaneDir(base, 'L'))
    case 'ArrowRight':
      return norm(selectPaneDir(base, 'R'))
    case 'ArrowUp':
      return norm(selectPaneDir(base, 'U'))
    case 'ArrowDown':
      return norm(selectPaneDir(base, 'D'))
    case 'z':
      return norm(toggleZoom(base))
    case 'x':
      return norm(killPane(base)) // NB: skips tmux's real y/n confirm prompt
    case 'c':
      return norm(newWindow(base))
    case 'n':
      return norm(selectWindowStep(base, 1))
    case 'p':
      return norm(selectWindowStep(base, -1))
    case ',':
      return { ...base, mode: 'rename-window', commandBuf: '' }
    case '&':
      return norm(killWindow(base)) // skips confirm
    case 'd':
      return norm(detach(base))
    case '$':
      return { ...base, mode: 'rename-session', commandBuf: '' }
    case '[':
      return enterCopyMode(base) // sets mode 'copy'
    case ']':
      return norm(paste(base))
    case ' ':
      return norm(nextLayout(base))
    case '{':
      return norm(swapPaneCycle(base, -1))
    case '}':
      return norm(swapPaneCycle(base, 1))
    case '!':
      return norm(breakPane(base))
    case ':':
      return { ...base, mode: 'command', commandBuf: '' }
    default:
      if (/^[0-9]$/.test(k.key)) return norm(selectWindowIndex(base, Number(k.key)))
      return { ...norm(base), status: `unknown key: ${k.key}` }
  }
}

function reduceCommand(s: TmuxState, k: Key): TmuxState {
  if (k.key === 'Enter') return runCommand({ ...s, mode: NORMAL, commandBuf: '' }, s.commandBuf)
  if (k.key === 'Escape') return { ...s, mode: NORMAL, commandBuf: '', status: undefined }
  if (k.key === 'Backspace') return { ...s, commandBuf: s.commandBuf.slice(0, -1) }
  if (isPrintable(k)) return { ...s, commandBuf: s.commandBuf + k.key }
  return s
}

function reduceRename(s: TmuxState, k: Key): TmuxState {
  const isWin = s.mode === 'rename-window'
  if (k.key === 'Enter') {
    const name = s.commandBuf.trim()
    const ns = name ? (isWin ? renameWindow(s, name) : renameSession(s, name)) : s
    return { ...ns, mode: NORMAL, commandBuf: '' }
  }
  if (k.key === 'Escape') return { ...s, mode: NORMAL, commandBuf: '' }
  if (k.key === 'Backspace') return { ...s, commandBuf: s.commandBuf.slice(0, -1) }
  if (isPrintable(k)) return { ...s, commandBuf: s.commandBuf + k.key }
  return s
}

function reduceCopy(s: TmuxState, k: Key): TmuxState {
  // While typing a `/` search, keys build the search string.
  if (s.copy?.search !== undefined) {
    if (k.key === 'Enter') return copySearchCommit(s)
    if (k.key === 'Escape') return copySearchCancel(s)
    if (k.key === 'Backspace') return copySearchInput(s, (c) => c.slice(0, -1))
    if (isPrintable(k)) return copySearchInput(s, (c) => c + k.key)
    return s
  }
  switch (k.key) {
    case 'h':
    case 'ArrowLeft':
      return copyMove(s, 0, -1)
    case 'l':
    case 'ArrowRight':
      return copyMove(s, 0, 1)
    case 'j':
    case 'ArrowDown':
      return copyMove(s, 1, 0)
    case 'k':
    case 'ArrowUp':
      return copyMove(s, -1, 0)
    case '0':
      return copyToLineEdge(s, 'start')
    case '$':
      return copyToLineEdge(s, 'end')
    case ' ':
    case 'v':
      return copySetAnchor(s)
    case 'y':
    case 'Enter':
      return copyYank(s)
    case '/':
      return copySearchStart(s)
    case 'q':
    case 'Escape':
      return exitCopyMode(s)
    default:
      return s
  }
}

/** Keys whose keydown produces no character and must never be counted or fed
 *  to the reducer. Includes AltGraph: on AZERTY (and many non-US layouts) common
 *  binding keys like '[' are typed as AltGr+<key>, and pressing AltGr fires a
 *  standalone 'AltGraph' keydown that would otherwise clear an armed prefix. */
export const MODIFIER_KEYS = new Set(['Shift', 'Control', 'Alt', 'AltGraph', 'Meta', 'CapsLock', 'Dead'])

/** True when this keydown is an AltGr composition producing a real character
 *  (AltGr reports as ctrl+alt on Windows/Linux, or via the AltGraph modifier). */
function isAltGraphChar(e: KeyboardEvent): boolean {
  const altGr = (typeof e.getModifierState === 'function' && e.getModifierState('AltGraph')) || (e.ctrlKey && e.altKey)
  return altGr && e.key.length === 1
}

/** Build a normalized Key from a DOM keyboard event (used by TmuxSurface). */
export function keyFromEvent(e: KeyboardEvent): Key {
  // AltGr-produced characters (e.g. AZERTY '[' = AltGr+5) carry the AltGr chord's
  // ctrl/alt flags, but the character itself is plain text / a plain binding key -
  // strip those flags so '[' matches like any other key and passes isPrintable.
  if (isAltGraphChar(e)) return { key: e.key, shift: e.shiftKey }
  return { key: e.key, ctrl: e.ctrlKey, alt: e.altKey, shift: e.shiftKey }
}
