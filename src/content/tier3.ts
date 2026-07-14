import type { Challenge } from '../game/types'
import { activeSessionNamed, allOf, clipboardContains, inMode, sessionCount, sessionDetached, sessionNamed } from '../tmux/verify'
import { single } from './build'

const LOG_LINES = [
  '[09:01] GET  /health      200',
  '[09:02] POST /login       200',
  '[09:03] ERROR upstream timeout',
  '[09:04] GET  /health      200',
]

/**
 * Tier 3 — "Sessions & Copy". Sessions outlive your terminal: detach (d) and
 * they keep running. Rename ($), spin up more (:new -s). Then copy mode ([) —
 * tmux's scrollback + search + yank, the muscle you reach for constantly.
 */
export const tier3: Challenge[] = [
  {
    id: 't3-detach',
    tier: 3,
    title: 'Detach',
    brief: 'Leave everything running and step away: detach from the session with prefix then d.',
    taughtCommands: ['detach'],
    start: single({ session: 'main', cmd: 'server' }),
    goal: { predicate: sessionDetached(), describe: 'The session is detached (still running)' },
    par: 2,
    hint: "Prefix then d detaches. Nothing is lost — later `tmux attach` drops you right back in.",
  },
  {
    id: 't3-rename-session',
    tier: 3,
    title: 'Name the Session',
    brief: "This session is 'main'. Give it a purpose-driven name 'work': prefix then $ then type it and Enter.",
    taughtCommands: ['rename-session'],
    start: single({ session: 'main' }),
    goal: { predicate: activeSessionNamed('work'), describe: "The session is named 'work'" },
    par: 7,
    hint: 'Prefix then $ opens the session rename prompt. Type work and Enter.',
  },
  {
    id: 't3-new-session',
    tier: 3,
    title: 'Second Session',
    brief: "Start a separate session for the API. Open the command prompt with prefix then : and run:  new -s api",
    taughtCommands: ['new-session', 'command-prompt'],
    start: single({ session: 'main' }),
    goal: { predicate: allOf(sessionCount(2), sessionNamed('api')), describe: "A second session 'api' exists" },
    par: 13,
    hint: "Prefix then : gives you tmux's command line. `new` is short for new-session; -s sets the name.",
  },
  {
    id: 't3-copy-mode',
    tier: 3,
    title: 'Enter Copy Mode',
    brief: 'To scroll back and read old output you enter copy mode: prefix then [.',
    taughtCommands: ['copy-mode'],
    start: single({ cmd: 'logs', content: LOG_LINES }),
    goal: { predicate: inMode('copy'), describe: 'You are in copy mode' },
    par: 2,
    hint: 'Prefix then [ enters copy mode. Now hjkl / arrows scroll; q leaves. This is how you read past output.',
  },
  {
    id: 't3-copy-yank',
    tier: 3,
    title: 'Copy a Line',
    brief: 'Copy the whole token line. Enter copy mode, press Space to start selecting, jump to end of line with $, then Enter to yank.',
    taughtCommands: ['copy-mode', 'copy-yank'],
    start: single({ cmd: 'sh', content: ['token: abc123'] }),
    goal: { predicate: clipboardContains('token'), describe: "The buffer holds the token line" },
    par: 5,
    hint: 'Prefix [ to enter copy mode. Space starts the selection, $ extends it to the end of the line, Enter (or y) copies.',
  },
  {
    id: 't3-capstone',
    tier: 3,
    title: 'Grep the Logs',
    brief: 'Find and copy the error line. Enter copy mode, search with / for ERROR, then select to end of line and yank it.',
    taughtCommands: ['copy-mode', 'copy-search', 'copy-yank'],
    start: single({ cmd: 'logs', content: LOG_LINES }),
    goal: { predicate: clipboardContains('ERROR'), describe: 'The error line is copied to the buffer' },
    par: 12,
    hint: 'Prefix [ then / opens search. Type ERROR and Enter to jump to it, then Space, $, y to copy that line.',
  },
]
