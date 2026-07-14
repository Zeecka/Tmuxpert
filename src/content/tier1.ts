import type { Challenge } from '../game/types'
import { splitActive } from '../tmux/ops'
import { activePaneCmd, allOf, layoutIs, paneCount, paneZoomed, splitDirIs } from '../tmux/verify'
import { single } from './build'

// Reusable starting layouts built by driving the pure ops (correct by
// construction — the same reducer proves the pars in tests/par.test.ts).
const vimThenSplitRight = splitActive(single({ cmd: 'vim' }), 'h') // vim (left) | shell (active, right)
const threePanes = splitActive(splitActive(single(), 'h'), 'v') // h[.v[..]], 3 panes

/**
 * Tier 1 — "Split". The prefix epiphany, then panes: % and " to split, o/arrows
 * to move, z to zoom, x to kill. This is tmux's grammar-defining idea — nothing
 * happens without the prefix first.
 */
export const tier1: Challenge[] = [
  {
    id: 't1-prefix',
    tier: 1,
    title: 'The Prefix',
    brief: 'Every tmux command starts with the prefix. Press the prefix (Ctrl-b), then % to split this pane into left and right.',
    taughtCommands: ['prefix', 'split-h'],
    start: single({ cmd: 'zsh' }),
    goal: { predicate: allOf(paneCount(2), splitDirIs('h')), describe: 'Two panes, side by side' },
    par: 2,
    hint: 'Hold Ctrl and tap b, release both, then press % (Shift+5). tmux never acts on a key until the prefix arms it.',
  },
  {
    id: 't1-split-v',
    tier: 1,
    title: "Stack 'em",
    brief: 'Now split top and bottom instead. Prefix, then " (Shift+quote).',
    taughtCommands: ['split-v'],
    start: single({ cmd: 'zsh' }),
    goal: { predicate: allOf(paneCount(2), splitDirIs('v')), describe: 'Two panes, stacked top and bottom' },
    par: 2,
    hint: 'The mnemonic: % is a tall divider (left|right), " looks like it stacks. Prefix then ".',
  },
  {
    id: 't1-navigate',
    tier: 1,
    title: 'Pane Hop',
    brief: 'Your editor is in the LEFT pane, but focus is on the right. Hop to the editor with prefix then o.',
    taughtCommands: ['select-pane'],
    start: vimThenSplitRight,
    goal: { predicate: activePaneCmd('vim'), describe: 'The vim pane is active' },
    par: 2,
    hint: 'Prefix then o cycles panes. (Prefix then an arrow key moves by direction — try ← too.)',
  },
  {
    id: 't1-zoom',
    tier: 1,
    title: 'Zoom In',
    brief: 'Too cramped? Temporarily blow the current pane up to fullscreen with prefix then z.',
    taughtCommands: ['zoom'],
    start: vimThenSplitRight,
    goal: { predicate: paneZoomed(), describe: 'The active pane is zoomed' },
    par: 2,
    hint: 'Prefix then z toggles zoom. Press it again later to pop back to the split — your panes are still there.',
  },
  {
    id: 't1-kill',
    tier: 1,
    title: 'Trim the Clutter',
    brief: 'Three panes is one too many. Close the current pane with prefix then x.',
    taughtCommands: ['kill-pane'],
    start: threePanes,
    goal: { predicate: paneCount(2), describe: 'Only two panes remain' },
    par: 2,
    hint: 'Prefix then x kills the active pane. (Real tmux asks y/n first; here it just closes.)',
  },
  {
    id: 't1-capstone',
    tier: 1,
    title: 'Dev Layout',
    brief: 'Build a classic dev layout: editor on the LEFT, with a server over logs on the RIGHT. Split left/right, then split the right pane top/bottom.',
    taughtCommands: ['split-h', 'split-v'],
    start: single({ cmd: 'vim' }),
    goal: { predicate: allOf(paneCount(3), layoutIs('h[.v[..]]')), describe: 'Editor left, two stacked panes right' },
    par: 4,
    hint: 'Prefix % gives you left|right and lands you in the new RIGHT pane. Prefix " then splits that one top/bottom.',
  },
]
