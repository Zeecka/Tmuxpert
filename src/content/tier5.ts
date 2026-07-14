import type { Challenge } from '../game/types'
import {
  activeWindowIndex,
  activeWindowNamed,
  allOf,
  paneCount,
  sessionCount,
  sessionNamed,
  splitDirIs,
  windowCount,
  windowNamed,
} from '../tmux/verify'
import { single, withWindows } from './build'

/**
 * Tier 5 — "Command Line". Everything you've done with the prefix, tmux can also
 * do from its command prompt (prefix : ) — and that's the door to scripting and
 * your ~/.tmux.conf. These teach the command form (and its short aliases).
 */
export const tier5: Challenge[] = [
  {
    id: 't5-cmd-open',
    tier: 5,
    title: 'The Command Line',
    brief: 'Open tmux’s command prompt with prefix then : and run:  splitw -v',
    taughtCommands: ['command-prompt', 'split-v'],
    start: single({ cmd: 'zsh' }),
    goal: { predicate: allOf(paneCount(2), splitDirIs('v')), describe: 'Split top/bottom from the command line' },
    par: 12,
    hint: '`splitw` is short for `split-window`; `-v` stacks the panes. Prefix : opens the prompt, then type it and Enter.',
  },
  {
    id: 't5-cmd-newwin',
    tier: 5,
    title: 'Named Window',
    brief: 'From the command line, make a named window. Prefix : then:  neww -n deploy',
    taughtCommands: ['command-prompt', 'new-window'],
    start: single({ window: 'main', cmd: 'zsh' }),
    goal: { predicate: allOf(windowCount(2), windowNamed('deploy')), describe: "A window named 'deploy' exists" },
    par: 17,
    hint: '`neww` = new-window; `-n` sets the name in one shot — no separate rename needed.',
  },
  {
    id: 't5-cmd-jump',
    tier: 5,
    title: 'Jump by Command',
    brief: 'Select a window by number from the prompt. Prefix : then:  selectw -t 2',
    taughtCommands: ['command-prompt', 'select-window'],
    start: withWindows([{ name: 'editor' }, { name: 'server' }, { name: 'logs' }]),
    goal: { predicate: activeWindowIndex(2), describe: 'Window 2 (logs) is active' },
    par: 15,
    hint: '`selectw -t 2` targets window index 2. `-t` (target) is how nearly every tmux command says "which one".',
  },
  {
    id: 't5-cmd-swap',
    tier: 5,
    title: 'Reorder Windows',
    brief: "The editor is window 1; move it to slot 0. Prefix : then:  swapw -t 0",
    taughtCommands: ['command-prompt', 'swap-window'],
    start: withWindows([{ name: 'logs' }, { name: 'editor' }], { activeIndex: 1 }),
    goal: { predicate: allOf(activeWindowIndex(0), activeWindowNamed('editor')), describe: 'editor is now window 0' },
    par: 13,
    hint: '`swapw -t 0` swaps the current window with window 0 — the active window rides along to its new slot.',
  },
  {
    id: 't5-cmd-newsession',
    tier: 5,
    title: 'Spin Up a Session',
    brief: 'Create a second, detached session from the prompt. Prefix : then:  new -s staging',
    taughtCommands: ['command-prompt', 'new-session'],
    start: single({ session: 'main' }),
    goal: { predicate: allOf(sessionCount(2), sessionNamed('staging')), describe: "A second session 'staging' exists" },
    par: 17,
    hint: '`new` = new-session; `-s` names it. It’s created in the background — you stay where you are.',
  },
  {
    id: 't5-capstone',
    tier: 5,
    title: 'Scripted Setup',
    brief: 'Script a workspace in two commands: make an api window, then split it. Prefix : then  neww -n api , then prefix : then  splitw -h',
    taughtCommands: ['command-prompt', 'new-window', 'split-h'],
    start: single({ window: 'main', cmd: 'zsh' }),
    goal: {
      predicate: allOf(windowCount(2), windowNamed('api'), paneCount(2)),
      describe: "An 'api' window split into two panes",
    },
    par: 26,
    hint: 'Two prompt runs: `neww -n api` creates and focuses the window, then `splitw -h` splits it left/right. This is the seed of a .tmux.conf startup script.',
  },
]
