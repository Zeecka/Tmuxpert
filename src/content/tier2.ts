import type { Challenge } from '../game/types'
import { activeWindowIndex, activeWindowNamed, allOf, windowCount, windowNamed } from '../tmux/verify'
import { single, withWindows } from './build'

/**
 * Tier 2 — "Windows". Panes live inside windows; windows are your tabs. Create
 * (c), rename (,), switch (n/p and by number), and close (&). Windows are
 * numbered from 0 — worth internalizing early.
 */
export const tier2: Challenge[] = [
  {
    id: 't2-new-window',
    tier: 2,
    title: 'New Window',
    brief: 'Panes not enough? Open a whole new window (like a new tab) with prefix then c.',
    taughtCommands: ['new-window'],
    start: single({ window: 'editor', cmd: 'vim' }),
    goal: { predicate: windowCount(2), describe: 'The session has two windows' },
    par: 2,
    hint: 'Prefix then c creates a fresh window and jumps you to it. The status bar at the bottom lists your windows.',
  },
  {
    id: 't2-rename',
    tier: 2,
    title: 'Name It',
    brief: "This window is called 'zsh'. Rename it to 'editor' so you can find it: prefix, then , then type the name and Enter.",
    taughtCommands: ['rename-window'],
    start: single({ window: 'zsh' }),
    goal: { predicate: activeWindowNamed('editor'), describe: "The window is named 'editor'" },
    par: 9,
    hint: 'Prefix then , opens a rename prompt. Type editor and press Enter.',
  },
  {
    id: 't2-switch',
    tier: 2,
    title: 'Window Hop',
    brief: "You're on window 0 (editor). Move to the next window with prefix then n.",
    taughtCommands: ['next-window'],
    start: withWindows([{ name: 'editor', cmd: 'vim' }, { name: 'server' }]),
    goal: { predicate: activeWindowIndex(1), describe: 'Window 1 (server) is active' },
    par: 2,
    hint: 'Prefix then n = next, prefix then p = previous. They wrap around.',
  },
  {
    id: 't2-jump',
    tier: 2,
    title: 'Jump by Number',
    brief: 'Windows are numbered from 0 in the status bar. Jump straight to window 2 with prefix then 2.',
    taughtCommands: ['select-window'],
    start: withWindows([{ name: 'editor' }, { name: 'server' }, { name: 'logs' }]),
    goal: { predicate: activeWindowIndex(2), describe: 'Window 2 (logs) is active' },
    par: 2,
    hint: 'Prefix then a digit jumps directly to that window number. Note the first window is 0, not 1.',
  },
  {
    id: 't2-kill-window',
    tier: 2,
    title: 'Close a Window',
    brief: 'The middle window is done with. Close the current window with prefix then &.',
    taughtCommands: ['kill-window'],
    start: withWindows([{ name: 'editor' }, { name: 'scratch' }, { name: 'logs' }], { activeIndex: 1 }),
    goal: { predicate: windowCount(2), describe: 'Two windows remain' },
    par: 2,
    hint: 'Prefix then & closes the whole window and every pane in it. (Real tmux confirms first.)',
  },
  {
    id: 't2-capstone',
    tier: 2,
    title: 'Workspace Setup',
    brief: "Round out your workspace: create a new window and name it 'logs'.",
    taughtCommands: ['new-window', 'rename-window'],
    start: single({ window: 'editor', cmd: 'vim' }),
    goal: { predicate: allOf(windowCount(2), windowNamed('logs')), describe: "A second window named 'logs' exists" },
    par: 9,
    hint: 'Prefix c makes the window (and focuses it), then prefix , to rename it to logs and Enter.',
  },
]
