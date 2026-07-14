import { useCallback, useRef, useState } from 'react'
import TmuxSurface, { type TmuxSurfaceHandle } from '../tmux/TmuxSurface'
import { ModeBadge } from '../ui/atoms'
import { Emoji } from '../ui/Emoji'
import { ResultScreen } from '../ui/ResultScreen'
import { HeroPanel, type Reaction } from '../ui/HeroPanel'
import { useGame, type CompleteOutcome } from '../game/store'
import { challengesForTier, worldMeta } from '../content/tiers'
import { stagesOf, type Challenge, type Tier } from '../game/types'
import type { Mode } from '../tmux/model'

interface Props {
  challenge: Challenge
  onPlay: (id: string) => void
  onMap: () => void
}

export function CampaignMode({ challenge, onPlay, onMap }: Props) {
  const complete = useGame((s) => s.completeChallenge)
  const [keystrokes, setKeystrokes] = useState(0)
  const [finalKs, setFinalKs] = useState(0)
  const [mode, setMode] = useState<Mode>('normal')
  const [outcome, setOutcome] = useState<CompleteOutcome | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [surfaceKey, setSurfaceKey] = useState(0)
  const [reaction, setReaction] = useState<Reaction>('idle')
  const [stageIdx, setStageIdx] = useState(0)
  const [failed, setFailed] = useState(false)
  const surfaceRef = useRef<TmuxSurfaceHandle>(null)
  const idleTimer = useRef<number | undefined>(undefined)

  const stages = stagesOf(challenge)
  const isBoss = challenge.kind === 'boss'
  const activeStage = stages[Math.min(stageIdx, stages.length - 1)]

  const world = worldMeta(challenge.tier)
  const siblings = challengesForTier(challenge.tier)
  const idx = siblings.findIndex((c) => c.id === challenge.id)
  const next = siblings[idx + 1]

  // Beating a boss leaps to the next world's first standard level; standard
  // levels step to the next sibling.
  const nextWorldFirst = isBoss
    ? challengesForTier((challenge.tier + 1) as Tier).find((c) => (c.kind ?? 'standard') !== 'boss')
    : undefined
  const nextTarget = isBoss ? nextWorldFirst : next

  const onKeystroke = useCallback((n: number) => {
    setKeystrokes(n)
    setReaction('typing')
    window.clearTimeout(idleTimer.current)
    idleTimer.current = window.setTimeout(() => setReaction('idle'), 900)
  }, [])

  const handleComplete = useCallback(
    (ks: number) => {
      window.clearTimeout(idleTimer.current)
      setFinalKs(ks)
      setKeystrokes(ks)
      const out = complete(challenge, ks)
      setReaction(out.leveledUp ? 'levelup' : 'win')
      setOutcome(out)
    },
    [challenge, complete],
  )

  const handleFail = useCallback((ks: number) => {
    window.clearTimeout(idleTimer.current)
    setFinalKs(ks)
    setFailed(true)
    setReaction('fail')
  }, [])

  const replay = () => {
    setOutcome(null)
    setKeystrokes(0)
    setFinalKs(0)
    setMode('normal')
    setShowHint(false)
    setReaction('idle')
    setStageIdx(0)
    setFailed(false)
    setSurfaceKey((k) => k + 1)
  }

  const revealHint = () => {
    setShowHint(true)
    surfaceRef.current?.focus()
  }

  const overPar = keystrokes > challenge.par

  return (
    <div className="relative mx-auto max-w-5xl px-4 py-6">
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="lg:w-72 lg:shrink-0">
          <HeroPanel reaction={reaction} />
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest" style={{ color: world.accent }}>
                World {challenge.tier} · {challenge.title}
              </p>
              <h2 className="mt-1 text-lg text-ink">{activeStage.brief ?? challenge.brief}</h2>
            </div>
            <div className="flex items-center gap-2">
              {stages.length > 1 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-magenta/40 bg-magenta/10 px-3 py-1 text-xs font-bold tabular-nums text-magenta">
                  {stages.map((_, i) => (
                    <span key={i} className={i < stageIdx ? 'opacity-100' : i === stageIdx ? 'animate-pulse' : 'opacity-30'}>
                      ◆
                    </span>
                  ))}
                  <span className="ml-0.5">
                    {Math.min(stageIdx + 1, stages.length)}/{stages.length}
                  </span>
                </span>
              )}
              <ModeBadge mode={mode} />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className={`inline-flex items-center gap-1.5 tabular-nums ${overPar ? 'text-amber' : 'text-term'}`}>
              <Emoji name="keyboard" size={15} /> {keystrokes}
            </span>
            <span className="text-ink-dim">par {challenge.par}</span>
            <span className="inline-flex items-center gap-1.5 rounded border border-border bg-panel-2/60 px-2 py-0.5 text-ink-dim sm:ml-auto">
              <Emoji name="target" size={15} /> {activeStage.goal.describe}
            </span>
          </div>

          {isBoss && challenge.keystrokeBudget !== undefined && <BossBar spent={keystrokes} budget={challenge.keystrokeBudget} />}

          <div
            className="panel-glass relative mt-3 h-[46vh] min-h-[280px] max-h-[520px] overflow-hidden"
            style={{ borderColor: `color-mix(in srgb, ${world.accent} 38%, var(--color-border))` }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(125% 78% at 50% -12%, color-mix(in srgb, ${world.accent} 20%, transparent), transparent 62%)`,
                boxShadow: `inset 0 0 70px -22px ${world.accent}`,
              }}
            />
            <div className="relative z-10 h-full">
              <TmuxSurface
                ref={surfaceRef}
                key={`${challenge.id}-${surfaceKey}`}
                challenge={challenge}
                onComplete={handleComplete}
                onKeystroke={onKeystroke}
                onModeChange={setMode}
                onStageAdvance={setStageIdx}
                onFail={handleFail}
                frozen={!!outcome || failed}
              />
            </div>
          </div>

          <div className="mt-3">
            {showHint ? (
              <div className="flex items-start gap-2.5 rounded-xl border border-amber/30 bg-amber/10 px-3.5 py-2.5 text-sm text-ink">
                <span className="mt-0.5 shrink-0">
                  <Emoji name="bulb" size={16} />
                </span>
                <span>
                  <span className="mr-1.5 text-[11px] font-bold uppercase tracking-widest text-amber">Hint</span>
                  {challenge.hint}
                </span>
              </div>
            ) : (
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={revealHint}
                className="group inline-flex items-center gap-2 rounded-full border border-border bg-panel-2/50 px-3.5 py-1.5 text-xs font-medium text-ink-dim transition-colors hover:border-amber hover:text-amber"
              >
                <Emoji name="bulb" size={14} />
                Need a hint?
              </button>
            )}
          </div>
        </div>
      </div>

      {outcome && (
        <ResultScreen
          outcome={outcome}
          keystrokes={finalKs}
          par={challenge.par}
          boss={isBoss}
          hasNext={!!nextTarget}
          nextLabel={isBoss ? 'Next world →' : 'Next →'}
          onNext={() => nextTarget && onPlay(nextTarget.id)}
          onReplay={replay}
          onMap={onMap}
        />
      )}

      {failed && !outcome && (
        <div className="absolute inset-0 z-30 grid place-items-center rounded-xl bg-bg/70 backdrop-blur-sm">
          <div className="panel w-full max-w-md p-6 text-center">
            <p className="font-terminal text-3xl font-bold text-danger">REPELLED!</p>
            <p className="mt-2 text-sm text-ink-dim">
              {challenge.title} shrugged off your {finalKs} keystrokes — the budget was {challenge.keystrokeBudget}. Every attempt
              teaches the pattern.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button onClick={replay} className="btn-primary rounded-xl px-5 py-2.5 font-bold">
                ⟳ Retry
              </button>
              <button
                onClick={onMap}
                className="rounded-xl border border-border px-5 py-2.5 text-ink-dim transition-colors hover:border-term hover:text-term"
              >
                Back to map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** Depleting keystroke-budget bar (boss levels). */
function BossBar({ spent, budget }: { spent: number; budget: number }) {
  const remaining = Math.max(0, budget - spent)
  const pct = (remaining / budget) * 100
  const color = pct > 50 ? 'var(--color-term)' : pct > 25 ? 'var(--color-amber)' : 'var(--color-danger)'
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-ink-dim">
        <span>Boss integrity</span>
        <span className="tabular-nums">{remaining} keystrokes left</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-panel-2">
        <div className="h-full rounded-full transition-[width,background-color] duration-200" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}
