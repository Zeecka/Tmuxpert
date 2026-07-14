/**
 * The tmux ':' command prompt — a small parser over the command subset that
 * matters for learning. Real tmux exposes ~200 commands; we cover the ones a
 * beginner/intermediate reaches for, plus common aliases (neww, splitw, …).
 * Config-style commands (set/bind/source-file) are accepted as no-ops so a
 * ".tmux.conf" capstone can be typed without errors.
 */
import type { SplitDir, TmuxState } from './model'
import {
  breakPane,
  detach,
  killPane,
  killWindow,
  newSession,
  newWindow,
  renameSession,
  renameWindow,
  resizeActive,
  selectPaneDir,
  selectWindowIndex,
  splitActive,
  swapWindowWith,
  type PaneDir,
} from './ops'

/** Split a command line into tokens, respecting simple single/double quotes. */
export function tokenize(line: string): string[] {
  const out: string[] = []
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(line)) !== null) out.push(m[1] ?? m[2] ?? m[3])
  return out
}

const ALIAS: Record<string, string> = {
  neww: 'new-window',
  new: 'new-session',
  news: 'new-session',
  splitw: 'split-window',
  killp: 'kill-pane',
  killw: 'kill-window',
  selectw: 'select-window',
  selectp: 'select-pane',
  swapw: 'swap-window',
  renamew: 'rename-window',
  rename: 'rename-session',
  resizep: 'resize-pane',
  detach: 'detach-client',
  set: 'set-option',
  setw: 'set-option',
  'set-window-option': 'set-option',
  bind: 'bind-key',
  unbind: 'unbind-key',
}

const NOOP = new Set(['set-option', 'bind-key', 'unbind-key', 'source-file'])

function flagValue(args: string[], flag: string): string | undefined {
  const i = args.indexOf(flag)
  return i >= 0 && i + 1 < args.length ? args[i + 1] : undefined
}

/** Non-flag tokens joined — the "name" argument for rename/new. */
function positional(args: string[]): string {
  return args.filter((a, i) => !a.startsWith('-') && !(i > 0 && args[i - 1] === '-t')).join(' ')
}

function paneDirFlag(args: string[]): PaneDir | undefined {
  if (args.includes('-L')) return 'L'
  if (args.includes('-R')) return 'R'
  if (args.includes('-U')) return 'U'
  if (args.includes('-D')) return 'D'
  return undefined
}

export function runCommand(s: TmuxState, line: string): TmuxState {
  const toks = tokenize(line.trim())
  if (toks.length === 0) return s
  const cmd = ALIAS[toks[0]] ?? toks[0]
  const args = toks.slice(1)

  if (NOOP.has(cmd)) return { ...s, status: undefined }

  switch (cmd) {
    case 'split-window': {
      const dir: SplitDir = args.includes('-h') ? 'h' : 'v' // tmux default is -v
      return splitActive(s, dir)
    }
    case 'new-window':
      return newWindow(s, flagValue(args, '-n'))
    case 'kill-pane':
      return killPane(s)
    case 'kill-window':
      return killWindow(s)
    case 'rename-window': {
      const name = positional(args)
      return name ? renameWindow(s, name) : { ...s, status: 'rename-window: need a name' }
    }
    case 'rename-session': {
      const name = positional(args)
      return name ? renameSession(s, name) : { ...s, status: 'rename-session: need a name' }
    }
    case 'select-window': {
      const t = flagValue(args, '-t')
      const idx = t !== undefined ? Number(t) : NaN
      return Number.isFinite(idx) ? selectWindowIndex(s, idx) : s
    }
    case 'select-pane': {
      const d = paneDirFlag(args)
      return d ? selectPaneDir(s, d) : s
    }
    case 'swap-window': {
      const t = flagValue(args, '-t')
      const idx = t !== undefined ? Number(t) : NaN
      return Number.isFinite(idx) ? swapWindowWith(s, idx) : s
    }
    case 'resize-pane': {
      const d = paneDirFlag(args)
      return d ? resizeActive(s, d) : s
    }
    case 'break-pane':
      return breakPane(s)
    case 'detach-client':
      return detach(s)
    case 'new-session':
      return newSession(s, flagValue(args, '-s'))
    default:
      return { ...s, status: `unknown command: ${cmd}` }
  }
}
