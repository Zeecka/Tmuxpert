import type { Challenge } from '../game/types'
import {
  activePaneContains,
  allOf,
  paneCount,
  splitResized,
  windowAtIndex,
} from '../tmux/verify'
import { selectPaneDir, splitActive } from '../tmux/ops'
import { single, withWindows } from './build'

/**
 * Tier 6 - "Power User". The graduation world: the two skills that don't fit
 * earlier tiers (resize a pane, paste the buffer) plus the command line as a
 * scripting tool. Starting states are built from the pure ops so we can begin
 * mid-workflow (e.g. already split) without new builders.
 */
export const tier6: Challenge[] = [
  {
    id: 't6-resize',
    tier: 6,
    title: 'Give It Room',
    brief: "Your editor pane is cramped. There's no default key for it - resize from the prompt: prefix : then  resizep -R  (Enter).",
    taughtCommands: ['resize-pane'],
    // Two-pane split, focus back on the left (editor) pane.
    start: selectPaneDir(splitActive(single({ cmd: 'editor' }), 'h', 'server'), 'L'),
    goal: { predicate: splitResized(), describe: 'The split has been resized off 50/50' },
    par: 13,
    hint: 'Prefix : opens the command prompt. Type resizep -R (an alias for resize-pane) and Enter to grow the pane rightward. Real tmux also binds C-b + Ctrl+arrow.',
  },
  {
    id: 't6-paste',
    tier: 6,
    title: 'Paste It Back',
    brief: "You copied  npm run deploy  earlier. Drop it into this shell: paste the buffer with prefix ].",
    taughtCommands: ['paste'],
    start: { ...single({ cmd: 'zsh' }), clipboard: 'npm run deploy' },
    goal: { predicate: activePaneContains('npm run deploy'), describe: 'The buffer has been pasted into the pane' },
    par: 2,
    hint: 'Prefix then ] pastes whatever is in your copy buffer. (You fill the buffer in copy mode with Space ... y.)',
  },
  {
    id: 't6-reorder',
    tier: 6,
    title: 'Reorder Windows',
    brief: "You're on 'server' (window 2) but it belongs first. There's no key for this - reorder from the prompt: prefix : then  swapw -t 0  (Enter).",
    taughtCommands: ['swap-window'],
    start: withWindows([{ name: 'logs' }, { name: 'editor' }, { name: 'server' }], { activeIndex: 2 }),
    goal: { predicate: windowAtIndex(0, 'server'), describe: "'server' is now window 0" },
    par: 13,
    hint: 'Prefix : then swapw -t 0 swaps the current window with window 0. swapw is the alias for swap-window.',
  },
  {
    id: 't6-cmd-split',
    tier: 6,
    title: 'Split by Script',
    brief: 'Configs and scripts build layouts from the command line, not keybindings. Split this window left/right: prefix : then  splitw -h  (Enter).',
    taughtCommands: ['split-h', 'command-prompt'],
    start: single({ cmd: 'zsh' }),
    goal: { predicate: paneCount(2), describe: 'The window has two panes' },
    par: 12,
    hint: 'Prefix : then splitw -h (alias for split-window -h). Use -v for a top/bottom split. This is exactly what a .tmux.conf layout does.',
  },
  {
    id: 't6-capstone',
    tier: 6,
    title: 'Build & Size',
    brief: 'Chain two commands: split this window left/right (splitw -h), then resize the new pane (resizep -L). All from the prompt.',
    taughtCommands: ['split-h', 'resize-pane'],
    start: single({ cmd: 'zsh' }),
    goal: { predicate: allOf(paneCount(2), splitResized()), describe: 'Two panes, and the split has been resized' },
    par: 25,
    hint: 'Prefix : splitw -h Enter makes the pane. Then prefix : resizep -L Enter nudges the divider. Two prompt commands, one tidy layout.',
  },
]
