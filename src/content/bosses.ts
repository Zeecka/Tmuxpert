import type { Challenge } from '../game/types'
import {
  activeSessionNamed,
  allOf,
  clipboardContains,
  layoutIs,
  paneCount,
  paneZoomed,
  splitDirIs,
  windowCount,
  windowNamed,
} from '../tmux/verify'
import { single } from './build'

/**
 * Bosses — multi-stage challenges fought in the SAME session, with a keystroke
 * "HP bar" (keystrokeBudget). Stages ratchet: once cleared they stay cleared.
 * Not unlock gates — they're the victory lap for a tier's whole toolkit.
 */
export const bosses: Challenge[] = [
  {
    id: 'b1-workspace',
    tier: 1,
    kind: 'boss',
    title: 'The Workspace',
    brief: 'Assemble a 2×2 grid: split left/right, split each side top/bottom until you have four panes.',
    taughtCommands: ['split-h', 'split-v', 'select-pane', 'zoom'],
    start: single({ cmd: 'vim' }),
    goal: { predicate: allOf(paneCount(4), layoutIs('h[v[..]v[..]]')), describe: 'Four panes in a 2×2 grid' },
    stages: [
      {
        brief: 'Grid built. Now zoom one pane to fullscreen to focus.',
        goal: { predicate: paneZoomed(), describe: 'A pane is zoomed' },
      },
    ],
    par: 10,
    keystrokeBudget: 22,
    hint: 'Prefix % (left|right), then prefix " to split the right pane. Prefix o back to the left, prefix " again — four panes. Finish with prefix z.',
  },
  {
    id: 'b2-session-rescue',
    tier: 3,
    kind: 'boss',
    title: 'Session Rescue',
    brief: "You've attached to a live incident. First, rename this session to 'rescue' (prefix $).",
    taughtCommands: ['rename-session', 'copy-mode', 'copy-search', 'copy-yank'],
    start: single({
      session: 'incident',
      cmd: 'logs',
      content: [
        '[incident] 500 on /checkout',
        '[incident] retrying upstream...',
        '[incident] ERROR payment gateway 503',
        '[incident] giving up after 3 tries',
      ],
    }),
    goal: { predicate: activeSessionNamed('rescue'), describe: "Session renamed to 'rescue'" },
    stages: [
      {
        brief: 'Now grep the logs: enter copy mode, search for ERROR, and copy that line.',
        goal: { predicate: clipboardContains('ERROR'), describe: 'The error line is in the copy buffer' },
      },
    ],
    par: 21,
    keystrokeBudget: 47,
    hint: 'Prefix $ then type rescue, Enter. Then prefix [ to enter copy mode, / to search ERROR, Enter, then Space $ y to copy the line.',
  },
  {
    id: 'b3-rebuild',
    tier: 4,
    kind: 'boss',
    title: 'The Rebuild',
    brief: 'Build a 2×2 grid: split left/right, then split each side top/bottom until you have four panes.',
    taughtCommands: ['split-h', 'split-v', 'next-layout', 'break-pane'],
    start: single({ cmd: 'vim' }),
    goal: { predicate: allOf(paneCount(4), layoutIs('h[v[..]v[..]]')), describe: 'Four panes in a 2×2 grid' },
    stages: [
      {
        brief: 'Grid built. Now cycle the layout so the panes stack (prefix Space).',
        goal: { predicate: splitDirIs('v'), describe: 'Layout cycled to a stacked arrangement' },
      },
      {
        brief: 'Finally, break the active pane out into its own window (prefix !).',
        goal: { predicate: windowCount(2), describe: 'A pane broken out to its own window' },
      },
    ],
    par: 12,
    keystrokeBudget: 27,
    hint: 'Prefix % , prefix " , prefix o , prefix " builds the grid. Then prefix Space cycles it, and prefix ! breaks a pane out.',
  },
  {
    id: 'b4-pipeline',
    tier: 5,
    kind: 'boss',
    title: 'Deploy Pipeline',
    brief: 'Do it all from the command line. First run  neww -n build  (prefix : then the command).',
    taughtCommands: ['command-prompt', 'new-window', 'split-h'],
    start: single({ session: 'ci', window: 'main', cmd: 'zsh' }),
    goal: { predicate: windowNamed('build'), describe: "A 'build' window created from the prompt" },
    stages: [
      {
        brief: 'Now split that window left/right from the prompt:  splitw -h',
        goal: { predicate: allOf(windowNamed('build'), paneCount(2)), describe: 'The build window is split into two panes' },
      },
    ],
    par: 28,
    keystrokeBudget: 62,
    hint: 'Prefix : then `neww -n build` (Enter). Then prefix : again and `splitw -h` (Enter). Everything tmux does, the command line does.',
  },
]
