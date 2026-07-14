/**
 * Tiny builders for challenge starting states, so content stays terse and
 * declarative. All produce a valid TmuxState with sequential ids.
 */
import { makeState, type Session, type TmuxState, type Window } from '../tmux/model'

/** A single-window, single-pane session (the common starting point). */
export const single = makeState

export interface WinSpec {
  name: string
  cmd?: string
  content?: string[]
}

/** A session with several windows (active = index 0 unless overridden). */
export function withWindows(specs: WinSpec[], opts?: { session?: string; activeIndex?: number }): TmuxState {
  let paneId = 1
  let winId = 1
  const windows: Window[] = specs.map((sp) => {
    const w: Window = {
      id: winId,
      name: sp.name,
      layout: { kind: 'pane', pane: { id: paneId, cmd: sp.cmd, content: sp.content } },
      activePaneId: paneId,
      zoomed: false,
    }
    paneId++
    winId++
    return w
  })
  const sess: Session = {
    id: 1,
    name: opts?.session ?? 'main',
    windows,
    activeWindowId: windows[opts?.activeIndex ?? 0].id,
    attached: true,
  }
  return {
    sessions: [sess],
    activeSessionId: 1,
    mode: 'normal',
    commandBuf: '',
    nextPaneId: paneId,
    nextWindowId: winId,
    nextSessionId: 2,
  }
}
