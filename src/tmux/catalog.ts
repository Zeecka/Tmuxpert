/**
 * The tmux binding catalog - the curriculum spine (analog of VimLegends's
 * commands.ts). Every binding/command a challenge can teach is tagged with a
 * category and the tier that introduces it. Drives the "Binding Belt" mastery
 * UI and is the source of truth for `taughtCommands` ids in content.
 */
export type BindingCategory = 'Prefix' | 'Panes' | 'Windows' | 'Sessions' | 'Copy mode' | 'Layout' | 'Command'

export interface Binding {
  id: string
  /** Human display of the keys, e.g. 'C-b %'. */
  keys: string
  label: string
  category: BindingCategory
  tier: 1 | 2 | 3 | 4 | 5 | 6
}

export const BINDINGS: Binding[] = [
  // Tier 1 - Panes
  { id: 'prefix', keys: 'C-b', label: 'Prefix key', category: 'Prefix', tier: 1 },
  { id: 'split-h', keys: 'C-b %', label: 'Split left/right', category: 'Panes', tier: 1 },
  { id: 'split-v', keys: 'C-b "', label: 'Split top/bottom', category: 'Panes', tier: 1 },
  { id: 'select-pane', keys: 'C-b o / ↑↓←→', label: 'Move between panes', category: 'Panes', tier: 1 },
  { id: 'zoom', keys: 'C-b z', label: 'Zoom pane', category: 'Panes', tier: 1 },
  { id: 'kill-pane', keys: 'C-b x', label: 'Kill pane', category: 'Panes', tier: 1 },

  // Tier 2 - Windows
  { id: 'new-window', keys: 'C-b c', label: 'New window', category: 'Windows', tier: 2 },
  { id: 'rename-window', keys: 'C-b ,', label: 'Rename window', category: 'Windows', tier: 2 },
  { id: 'next-window', keys: 'C-b n', label: 'Next window', category: 'Windows', tier: 2 },
  { id: 'prev-window', keys: 'C-b p', label: 'Previous window', category: 'Windows', tier: 2 },
  { id: 'select-window', keys: 'C-b 0...9', label: 'Jump to window N', category: 'Windows', tier: 2 },
  { id: 'kill-window', keys: 'C-b &', label: 'Kill window', category: 'Windows', tier: 2 },

  // Tier 3 - Sessions
  { id: 'detach', keys: 'C-b d', label: 'Detach session', category: 'Sessions', tier: 3 },
  { id: 'rename-session', keys: 'C-b $', label: 'Rename session', category: 'Sessions', tier: 3 },
  { id: 'new-session', keys: ':new -s', label: 'New session', category: 'Sessions', tier: 3 },

  // Tier 3 - Copy mode
  { id: 'copy-mode', keys: 'C-b [', label: 'Enter copy mode', category: 'Copy mode', tier: 3 },
  { id: 'copy-search', keys: '/', label: 'Search scrollback', category: 'Copy mode', tier: 3 },
  { id: 'copy-yank', keys: 'Space ... Enter', label: 'Select & copy', category: 'Copy mode', tier: 3 },
  { id: 'paste', keys: 'C-b ]', label: 'Paste buffer', category: 'Copy mode', tier: 3 },

  // Tier 4 - Layout / rearrange
  { id: 'next-layout', keys: 'C-b Space', label: 'Cycle layouts', category: 'Layout', tier: 4 },
  { id: 'swap-pane', keys: 'C-b { / }', label: 'Swap panes', category: 'Layout', tier: 4 },
  { id: 'break-pane', keys: 'C-b !', label: 'Break pane to window', category: 'Layout', tier: 4 },

  // Tier 5 - Command line
  { id: 'command-prompt', keys: 'C-b :', label: 'Command prompt', category: 'Command', tier: 5 },
  { id: 'swap-window', keys: ':swap-window', label: 'Reorder windows', category: 'Command', tier: 5 },

  // Tier 6 - Power user
  { id: 'resize-pane', keys: 'C-b C-<arrow> / :resizep', label: 'Resize pane', category: 'Layout', tier: 6 },
]

export const BINDING_BY_ID: Record<string, Binding> = Object.fromEntries(BINDINGS.map((b) => [b.id, b]))

export const CATEGORY_ORDER: BindingCategory[] = ['Prefix', 'Panes', 'Windows', 'Sessions', 'Copy mode', 'Layout', 'Command']
