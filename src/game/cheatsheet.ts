/**
 * The tmux cheatsheet - a curated, accurate quick-reference organized the way a
 * learner reaches for it. This is the SINGLE SOURCE OF TRUTH shared by the
 * in-app cheatsheet modal (src/ui/CheatsheetModal.tsx) and the offline PDF
 * export (src/game/pdf.ts), so the two can never drift.
 *
 * Rows tagged `sim: true` are things you can actually practise inside TmuxLegends's
 * simulator today; untagged rows are real-tmux reference the trainer doesn't
 * (yet) simulate. Keys assume tmux's default prefix, C-b.
 */

/** The tmux default prefix. Shown once up top so rows stay terse. */
export const PREFIX_LABEL = 'C-b'

export interface CheatRow {
  /** Key sequence or command, e.g. 'C-b %' or ':new-window -n name'. */
  keys: string
  /** What it does, one terse line. */
  desc: string
  /** Playable in the TmuxLegends simulator right now. */
  sim?: boolean
  /** Stable translation id (`<sectionIndex>.<rowIndex>`), assigned below. */
  tid?: string
}

export interface CheatSection {
  title: string
  /** Optional one-line intro shown under the section heading. */
  blurb?: string
  rows: CheatRow[]
  /** Stable translation slug (the section index), assigned below. */
  slug?: string
}

export const CHEATSHEET: CheatSection[] = [
  {
    title: 'The prefix',
    blurb: 'Every tmux binding starts with the prefix. Press it, release, then the command key.',
    rows: [
      { keys: 'C-b', desc: 'The prefix (Ctrl+b). Precedes every binding below.', sim: true },
      { keys: 'C-b C-b', desc: 'Send a literal C-b to the program in the pane.' },
      { keys: 'C-b :', desc: 'Open the tmux command prompt.', sim: true },
      { keys: 'C-b ?', desc: 'List every key binding (searchable help).' },
      { keys: 'C-b t', desc: 'Show a big clock in the pane.' },
      { keys: 'C-b d', desc: 'Detach - leave the session running in the background.', sim: true },
    ],
  },
  {
    title: 'Panes',
    blurb: 'Panes are splits inside one window. tmux names them backwards from what you expect.',
    rows: [
      { keys: 'C-b %', desc: 'Split into left | right panes.', sim: true },
      { keys: 'C-b "', desc: 'Split into top / bottom panes.', sim: true },
      { keys: 'C-b o', desc: 'Cycle to the next pane.', sim: true },
      { keys: 'C-b ; ', desc: 'Jump to the last-used pane.' },
      { keys: 'C-b <arrows>', desc: 'Move to the pane in that direction.', sim: true },
      { keys: 'C-b q', desc: 'Flash each pane number (press the digit to jump).' },
      { keys: 'C-b z', desc: 'Zoom the active pane to fullscreen (toggle).', sim: true },
      { keys: 'C-b x', desc: 'Kill the active pane.', sim: true },
      { keys: 'C-b Space', desc: 'Cycle through the preset layouts.', sim: true },
      { keys: 'C-b { / }', desc: 'Swap the active pane with the previous / next one.', sim: true },
      { keys: 'C-b !', desc: 'Break the active pane out into its own window.', sim: true },
      { keys: 'C-b C-<arrow>', desc: 'Resize the active pane (hold Ctrl, repeat).', sim: true },
    ],
  },
  {
    title: 'Windows',
    blurb: 'Windows are your tabs. The status bar lists them, numbered from 0.',
    rows: [
      { keys: 'C-b c', desc: 'Create a new window.', sim: true },
      { keys: 'C-b ,', desc: 'Rename the current window.', sim: true },
      { keys: 'C-b &', desc: 'Kill the current window (and all its panes).', sim: true },
      { keys: 'C-b n / p', desc: 'Next / previous window.', sim: true },
      { keys: 'C-b 0 ... 9', desc: 'Jump straight to window N.', sim: true },
      { keys: 'C-b l', desc: 'Toggle to the last-used window.' },
      { keys: 'C-b w', desc: 'Interactive window/session picker.' },
      { keys: 'C-b f', desc: 'Find a window by the text on screen.' },
      { keys: 'C-b .', desc: 'Renumber (move) the current window.' },
    ],
  },
  {
    title: 'Sessions',
    blurb: 'A session is a set of windows. Detach and it keeps running; re-attach anytime.',
    rows: [
      { keys: 'C-b d', desc: 'Detach the current session.', sim: true },
      { keys: 'C-b $', desc: 'Rename the current session.', sim: true },
      { keys: 'C-b s', desc: 'Interactive session switcher.' },
      { keys: 'C-b ( / )', desc: 'Switch to the previous / next session.' },
      { keys: 'tmux new -s NAME', desc: 'Start a new named session (from the shell).' },
      { keys: 'tmux attach -t NAME', desc: 'Re-attach to a running session.' },
      { keys: 'tmux ls', desc: 'List all sessions.' },
      { keys: 'tmux kill-session -t NAME', desc: 'End a session.' },
    ],
  },
  {
    title: 'Copy mode',
    blurb: 'Scroll back, search the output, and copy without a mouse. (vi-style keys shown.)',
    rows: [
      { keys: 'C-b [', desc: 'Enter copy mode (scrollback).', sim: true },
      { keys: 'q  /  Esc', desc: 'Leave copy mode.', sim: true },
      { keys: 'h j k l / arrows', desc: 'Move the cursor.', sim: true },
      { keys: '0  /  $', desc: 'Jump to start / end of line.', sim: true },
      { keys: 'Space', desc: 'Begin the selection.', sim: true },
      { keys: 'Enter  /  y', desc: 'Copy the selection and exit.', sim: true },
      { keys: '/ TEXT', desc: 'Search forward through the buffer.', sim: true },
      { keys: '? TEXT', desc: 'Search backward.' },
      { keys: 'n  /  N', desc: 'Repeat the search forward / backward.' },
      { keys: 'C-b ]', desc: 'Paste the copy buffer into the pane.', sim: true },
    ],
  },
  {
    title: 'Command line  ( C-b : )',
    blurb: 'Anything tmux does, the command prompt does - and it scripts. Aliases in ().',
    rows: [
      { keys: ':new-window -n NAME  (neww)', desc: 'Create and name a window.', sim: true },
      { keys: ':split-window -h/-v  (splitw)', desc: 'Split the active pane.', sim: true },
      { keys: ':select-window -t N  (selectw)', desc: 'Focus window N.', sim: true },
      { keys: ':swap-window -t N  (swapw)', desc: 'Reorder: swap this window with N.', sim: true },
      { keys: ':select-pane -L/-R/-U/-D', desc: 'Focus the pane in that direction.', sim: true },
      { keys: ':resize-pane -L/-R/-U/-D  (resizep)', desc: 'Grow/shrink the active pane.', sim: true },
      { keys: ':break-pane  /  :kill-pane', desc: 'Break out / close the active pane.', sim: true },
      { keys: ':new-session -s NAME  (new)', desc: 'Create a new detached session.', sim: true },
      { keys: ':rename-window / :rename-session', desc: 'Rename from the prompt.', sim: true },
      { keys: ':source-file ~/.tmux.conf', desc: 'Reload your config without restarting.' },
    ],
  },
]

// Stable translation ids so the in-app modal can localize titles/blurbs/rows
// (the offline PDF stays English). Index-based, so they never drift as long as
// the array order is preserved.
CHEATSHEET.forEach((sec, si) => {
  sec.slug = String(si)
  sec.rows.forEach((row, ri) => {
    row.tid = `${si}.${ri}`
  })
})

/** Flat count of everything documented - handy for headers/badges. */
export const CHEAT_ROW_COUNT = CHEATSHEET.reduce((n, s) => n + s.rows.length, 0)

/** Case-insensitive filter that keeps a section only if it has matching rows. */
export function filterCheatsheet(query: string): CheatSection[] {
  const q = query.trim().toLowerCase()
  if (!q) return CHEATSHEET
  return CHEATSHEET.map((sec) => {
    if (sec.title.toLowerCase().includes(q)) return sec
    const rows = sec.rows.filter((r) => r.keys.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q))
    return rows.length ? { ...sec, rows } : null
  }).filter((s): s is CheatSection => s !== null)
}
