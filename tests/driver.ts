/**
 * Headless solution driver - feeds a keystroke string through the pure reducer
 * and reports whether a challenge's (possibly multi-stage, ratcheted) goals are
 * cleared. The tmux analog of VimLegends's tests/driver.ts, but far simpler:
 * the engine has no DOM, so there are no jsdom shims.
 *
 * Solution string grammar (no decorative whitespace - every char counts):
 *   C-b      a Ctrl+key combo (the prefix)
 *   <CR>     Enter          <Esc>   Escape       <Space> space
 *   <BS>     Backspace      <Left>/<Right>/<Up>/<Down>  arrow keys
 *   any other single char   that literal key (a real space also works)
 */
import { reduce, type Key } from '../src/tmux/engine'
import { cloneState, type TmuxState } from '../src/tmux/model'
import { checkGoal } from '../src/game/runtime'
import { stagesOf, type Challenge } from '../src/game/types'

const NAMED: Record<string, Key> = {
  CR: { key: 'Enter' },
  Esc: { key: 'Escape' },
  Space: { key: ' ' },
  BS: { key: 'Backspace' },
  Left: { key: 'ArrowLeft' },
  Right: { key: 'ArrowRight' },
  Up: { key: 'ArrowUp' },
  Down: { key: 'ArrowDown' },
  Tab: { key: 'Tab' },
}

export function tokenize(sol: string): Key[] {
  const keys: Key[] = []
  let i = 0
  while (i < sol.length) {
    const ctrl = /^C-(\S)/.exec(sol.slice(i))
    if (ctrl) {
      keys.push({ key: ctrl[1], ctrl: true })
      i += ctrl[0].length
      continue
    }
    if (sol[i] === '<') {
      const end = sol.indexOf('>', i)
      if (end > i) {
        const name = sol.slice(i + 1, end)
        const k = NAMED[name]
        if (!k) throw new Error(`unknown token <${name}>`)
        keys.push(k)
        i = end + 1
        continue
      }
    }
    keys.push({ key: sol[i] })
    i += 1
  }
  return keys
}

export function play(start: TmuxState, keys: Key[]): TmuxState {
  return keys.reduce(reduce, cloneState(start))
}

export interface StageRun {
  cleared: number
  total: number
  used: number
  final: TmuxState
}

/** Drive `keys` through a challenge, advancing through ratcheted stages exactly
 *  like the runtime does (a cleared stage stays cleared). */
export function solveStaged(ch: Challenge, keys: Key[]): StageRun {
  const stages = stagesOf(ch)
  let state = cloneState(ch.start)
  let stage = 0
  const advance = () => {
    while (stage < stages.length && checkGoal(state, stages[stage].goal)) stage++
  }
  advance() // in case a stage is already satisfied (should never be)
  let used = 0
  for (let n = 0; n < keys.length && stage < stages.length; n++) {
    state = reduce(state, keys[n])
    used = n + 1
    advance()
  }
  return { cleared: stage, total: stages.length, used, final: state }
}
