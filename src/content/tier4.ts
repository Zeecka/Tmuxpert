import type { Challenge } from '../game/types'
import { splitActive } from '../tmux/ops'
import { allOf, firstPaneCmd, splitDirIs, windowCount } from '../tmux/verify'
import { single } from './build'

// Starting layouts built by driving the pure ops (correct by construction).
const stackedThree = splitActive(splitActive(single({ cmd: 'vim' }), 'v'), 'v') // v[.v[..]], 3 stacked panes
const logsLeftVimRight = splitActive(single({ cmd: 'logs' }), 'h', 'vim') // logs | vim(active)
const serverLeftVimRight = splitActive(single({ cmd: 'server' }), 'h', 'vim') // server | vim(active)
const threeToBreak = splitActive(splitActive(single(), 'h'), 'v', 'db') // h[.v[..]] with db pane active

/**
 * Tier 4 — "Rearrange". Once you have panes, you shape them: cycle the layout
 * (Space), swap panes around ({ / }), and break a pane out into its own window
 * (!). This is how a cramped workspace becomes the one you actually want.
 */
export const tier4: Challenge[] = [
  {
    id: 't4-cycle',
    tier: 4,
    title: 'Cycle Layouts',
    brief: 'Your panes are stacked. Snap them into a tidy side-by-side layout with prefix then Space.',
    taughtCommands: ['next-layout'],
    start: stackedThree,
    goal: { predicate: splitDirIs('h'), describe: 'Panes tiled side by side' },
    par: 2,
    hint: 'Prefix then Space cycles through tmux’s preset layouts — press it to rebalance the panes.',
  },
  {
    id: 't4-swap',
    tier: 4,
    title: 'Swap Panes',
    brief: 'Your editor opened on the right. Swap it to the left with prefix then }.',
    taughtCommands: ['swap-pane'],
    start: logsLeftVimRight,
    goal: { predicate: firstPaneCmd('vim'), describe: 'The vim pane is now on the left' },
    par: 2,
    hint: 'Prefix } swaps the active pane with the next one; prefix { swaps with the previous.',
  },
  {
    id: 't4-break',
    tier: 4,
    title: 'Break It Out',
    brief: 'This db pane deserves its own window. Break the active pane out with prefix then !.',
    taughtCommands: ['break-pane'],
    start: threeToBreak,
    goal: { predicate: windowCount(2), describe: 'The pane became its own window' },
    par: 2,
    hint: 'Prefix ! (break-pane) moves the active pane into a brand-new window and jumps you to it.',
  },
  {
    id: 't4-swap-cycle',
    tier: 4,
    title: 'Rearrange & Tidy',
    brief: 'Get vim on the left, then stack the panes top/bottom: swap ( } ), then cycle the layout (Space).',
    taughtCommands: ['swap-pane', 'next-layout'],
    start: logsLeftVimRight,
    goal: { predicate: allOf(firstPaneCmd('vim'), splitDirIs('v')), describe: 'vim on top, panes stacked' },
    par: 4,
    hint: 'Prefix } moves vim to the front, then prefix Space cycles the side-by-side split into a stacked one.',
  },
  {
    id: 't4-capstone',
    tier: 4,
    title: 'Workspace Surgery',
    brief: 'First swap vim to the left with prefix }.',
    taughtCommands: ['swap-pane', 'select-pane', 'break-pane'],
    start: serverLeftVimRight,
    goal: { predicate: firstPaneCmd('vim'), describe: 'vim is on the left' },
    stages: [
      {
        brief: 'Now give the server its own window: select it (prefix o), then break it out (prefix !).',
        goal: { predicate: windowCount(2), describe: 'server broken out into its own window' },
      },
    ],
    par: 6,
    hint: 'Prefix } swaps vim left. Prefix o hops to the server pane, then prefix ! breaks it into a new window.',
  },
]
