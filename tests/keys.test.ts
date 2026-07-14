import { describe, expect, it } from 'vitest'
import { MODIFIER_KEYS, keyFromEvent } from '../src/tmux/engine'

// A minimal stand-in for a DOM KeyboardEvent (vitest runs in node — no DOM).
function ev(init: {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  altGraph?: boolean
}): KeyboardEvent {
  return {
    key: init.key,
    ctrlKey: !!init.ctrlKey,
    altKey: !!init.altKey,
    shiftKey: !!init.shiftKey,
    getModifierState: (m: string) => (m === 'AltGraph' ? !!init.altGraph : false),
  } as unknown as KeyboardEvent
}

describe('AZERTY / AltGr key handling', () => {
  it('AltGraph is treated as a modifier (ignored keydown)', () => {
    expect(MODIFIER_KEYS.has('AltGraph')).toBe(true)
  })

  it("strips the AltGr chord from characters typed via the AltGraph modifier (AZERTY '[' = AltGr+5)", () => {
    // Linux/modern browsers: AltGr reported via getModifierState('AltGraph').
    const k = keyFromEvent(ev({ key: '[', altGraph: true }))
    expect(k).toEqual({ key: '[', shift: false })
    expect(k.ctrl).toBeUndefined()
    expect(k.alt).toBeUndefined()
  })

  it('strips the AltGr chord when reported as ctrl+alt (Windows AltGr)', () => {
    const k = keyFromEvent(ev({ key: '[', ctrlKey: true, altKey: true }))
    expect(k).toEqual({ key: '[', shift: false })
  })

  it('leaves a real Ctrl-b (the prefix) intact', () => {
    const k = keyFromEvent(ev({ key: 'b', ctrlKey: true }))
    expect(k).toEqual({ key: 'b', ctrl: true, alt: false, shift: false })
  })

  it('preserves shift on an AltGr character', () => {
    const k = keyFromEvent(ev({ key: '{', altGraph: true, shiftKey: true }))
    expect(k).toEqual({ key: '{', shift: true })
  })
})
