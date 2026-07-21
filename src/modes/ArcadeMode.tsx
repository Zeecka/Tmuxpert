import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { KeyCap } from '../ui/atoms'
import { Emoji } from '../ui/Emoji'
import { MODIFIER_KEYS, isPrefix, keyFromEvent } from '../tmux/engine'
import { sfx } from '../game/sound'
import { useGame } from '../game/store'

const DURATION = 30

interface Drill {
  label: string
  /** The key that must follow the prefix (matched against event.key). */
  key: string
  display: string
  binding: string
}

const DRILLS: Drill[] = [
  { label: 'Split left / right', key: '%', display: '%', binding: 'split-h' },
  { label: 'Split top / bottom', key: '"', display: '"', binding: 'split-v' },
  { label: 'New window', key: 'c', display: 'c', binding: 'new-window' },
  { label: 'Next window', key: 'n', display: 'n', binding: 'next-window' },
  { label: 'Previous window', key: 'p', display: 'p', binding: 'prev-window' },
  { label: 'Zoom pane', key: 'z', display: 'z', binding: 'zoom' },
  { label: 'Cycle panes', key: 'o', display: 'o', binding: 'select-pane' },
  { label: 'Kill pane', key: 'x', display: 'x', binding: 'kill-pane' },
  { label: 'Detach session', key: 'd', display: 'd', binding: 'detach' },
  { label: 'Copy mode', key: '[', display: '[', binding: 'copy-mode' },
]

type Phase = 'ready' | 'playing' | 'over'

/** Prefix Rush - a 30-second reflex drill for the prefix-then-key combos. Fire
 *  the prefix (Ctrl-b) then the shown key as fast as you can. Analog of
 *  VimLegends's Motion Rush. */
export function ArcadeMode() {
  const best = useGame((s) => s.arcadeBest)
  const record = useGame((s) => s.recordArcade)

  const [phase, setPhase] = useState<Phase>('ready')
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const [drill, setDrill] = useState<Drill>(DRILLS[0])
  const [armed, setArmed] = useState(false)
  const [flash, setFlash] = useState<'hit' | 'miss' | null>(null)
  const [result, setResult] = useState<{ isNewBest: boolean; coinsGained: number; score: number } | null>(null)

  const armedRef = useRef(false)
  const drillRef = useRef(drill)
  const comboRef = useRef(0)
  const hitIds = useRef<Set<string>>(new Set())
  armedRef.current = armed
  drillRef.current = drill

  const pickDrill = useCallback(() => {
    const i = Math.floor(Math.random() * DRILLS.length)
    setDrill(DRILLS[i])
  }, [])

  const start = () => {
    setScore(0)
    setCombo(0)
    comboRef.current = 0
    setTimeLeft(DURATION)
    setArmed(false)
    armedRef.current = false
    hitIds.current = new Set()
    setResult(null)
    pickDrill()
    setPhase('playing')
  }

  // Countdown.
  useEffect(() => {
    if (phase !== 'playing') return
    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.1) {
          window.clearInterval(id)
          return 0
        }
        return +(t - 0.1).toFixed(1)
      })
    }, 100)
    return () => window.clearInterval(id)
  }, [phase])

  // End the round when the clock runs out.
  useEffect(() => {
    if (phase === 'playing' && timeLeft <= 0) {
      const r = record(score, [...hitIds.current])
      setResult({ ...r, score })
      setPhase('over')
    }
  }, [phase, timeLeft, score, record])

  const flashFor = (kind: 'hit' | 'miss') => {
    setFlash(kind)
    window.setTimeout(() => setFlash(null), 160)
  }

  // Input handling.
  useEffect(() => {
    if (phase !== 'playing') return
    const onKey = (e: KeyboardEvent) => {
      const k = keyFromEvent(e)
      if (MODIFIER_KEYS.has(e.key)) return
      e.preventDefault()

      if (isPrefix(k)) {
        setArmed(true)
        armedRef.current = true
        return
      }
      if (!armedRef.current) {
        // Pressed a key without arming the prefix first - a miss.
        registerMiss()
        return
      }
      setArmed(false)
      armedRef.current = false
      if (k.key === drillRef.current.key) registerHit()
      else registerMiss()
    }

    const registerHit = () => {
      const c = comboRef.current + 1
      comboRef.current = c
      setCombo(c)
      const mult = Math.min(5, 1 + Math.floor((c - 1) / 3))
      setScore((s) => s + 10 * mult)
      hitIds.current.add(drillRef.current.binding)
      sfx.combo(c)
      flashFor('hit')
      pickDrill()
    }

    const registerMiss = () => {
      comboRef.current = 0
      setCombo(0)
      sfx.error()
      flashFor('miss')
    }

    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [phase, pickDrill])

  const mult = Math.min(5, 1 + Math.floor(combo / 3))

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="text-center">
        <h2 className="title-gradient font-terminal text-4xl font-bold">Prefix Rush</h2>
        <p className="mt-2 text-sm text-ink-dim">
          {DURATION} seconds. Fire the <KeyCap>C-b</KeyCap> prefix, then the shown key - as fast as you can.
        </p>
      </div>

      {phase === 'ready' && (
        <div className="panel mt-8 flex flex-col items-center gap-4 p-8 text-center">
          <Emoji name="bolt" size={48} />
          <p className="text-ink-dim">
            Best: <span className="font-terminal text-xl text-term">{best}</span>
          </p>
          <button onClick={start} className="btn-primary rounded-xl px-6 py-3 font-bold">
            Start drill
          </button>
        </div>
      )}

      {phase === 'playing' && (
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-dim">
              SCORE <span className="font-terminal text-xl text-ink">{score}</span>
            </span>
            <span className="text-ink-dim">
              COMBO <span className="font-terminal text-xl text-magenta">×{mult}</span>
              {combo > 0 && <span className="ml-1 text-xs text-ink-dim">({combo})</span>}
            </span>
            <span className="text-ink-dim tabular-nums">
              TIME <span className="font-terminal text-xl text-amber">{timeLeft.toFixed(1)}</span>
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-panel-2">
            <div className="h-full rounded-full bg-amber transition-[width] duration-100" style={{ width: `${(timeLeft / DURATION) * 100}%` }} />
          </div>

          <motion.div
            key={drill.label}
            initial={{ scale: 0.8, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            className={`panel mt-6 grid place-items-center gap-4 p-10 text-center transition-colors ${
              flash === 'hit' ? 'border-term' : flash === 'miss' ? 'border-danger' : ''
            }`}
          >
            <p className="text-lg text-ink-dim">{drill.label}</p>
            <div className="flex items-center gap-2">
              <KeyCap>C-b</KeyCap>
              <span className="text-ink-dim">then</span>
              <KeyCap>{drill.display}</KeyCap>
            </div>
            <p className={`text-xs ${armed ? 'text-term' : 'text-ink-dim/60'}`}>{armed ? 'prefix armed - press the key!' : 'press the prefix first'}</p>
          </motion.div>
        </div>
      )}

      {phase === 'over' && result && (
        <div className="panel mt-8 flex flex-col items-center gap-3 p-8 text-center">
          <p className="title-gradient font-terminal text-3xl font-bold">TIME!</p>
          <p className="font-terminal text-5xl text-term">{result.score}</p>
          {result.isNewBest ? (
            <p className="text-amber glow-amber">★ New best!</p>
          ) : (
            <p className="text-sm text-ink-dim">best {best}</p>
          )}
          {result.coinsGained > 0 && (
            <p className="inline-flex items-center gap-1.5 text-amber">
              +{result.coinsGained} <span className="coin" />
            </p>
          )}
          <button onClick={start} className="btn-primary mt-2 rounded-xl px-6 py-3 font-bold">
            Go again
          </button>
        </div>
      )}
    </div>
  )
}
