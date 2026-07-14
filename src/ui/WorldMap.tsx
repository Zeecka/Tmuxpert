import { StarRow } from './atoms'
import { Emoji } from './Emoji'
import { WORLDS, challengesForTier, tierUnlocked } from '../content/tiers'
import { useGame } from '../game/store'
import type { Challenge } from '../game/types'

export function WorldMap({ onPlay }: { onPlay: (id: string) => void }) {
  const completed = useGame((s) => s.completed)

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h2 className="font-terminal text-3xl font-bold text-ink">Campaign</h2>
      <p className="mt-1 text-sm text-ink-dim">Learn tmux one binding at a time. Clear a world's levels to unlock the next.</p>

      <div className="mt-6 space-y-6">
        {WORLDS.map((world) => {
          const unlocked = tierUnlocked(world.tier, completed)
          const levels = challengesForTier(world.tier)
          const cleared = levels.filter((c) => c.kind !== 'boss').every((c) => completed[c.id])
          return (
            <section
              key={world.tier}
              className="panel p-5"
              style={{ borderColor: `color-mix(in srgb, ${world.accent} 35%, var(--color-border))` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-terminal text-xl font-bold" style={{ color: world.accent }}>
                    {world.tier}. {world.name}
                  </h3>
                  <p className="text-xs text-ink-dim">{world.subtitle}</p>
                </div>
                <StatusChip unlocked={unlocked} cleared={cleared} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
                {levels.map((ch, i) => {
                  const prev = levels[i - 1]
                  const levelUnlocked = unlocked && (i === 0 || !!completed[prev.id])
                  return (
                    <LevelCard
                      key={ch.id}
                      ch={ch}
                      accent={world.accent}
                      locked={!levelUnlocked}
                      stars={completed[ch.id]?.stars ?? 0}
                      onPlay={() => onPlay(ch.id)}
                    />
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function StatusChip({ unlocked, cleared }: { unlocked: boolean; cleared: boolean }) {
  if (!unlocked)
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-panel-2/60 px-3 py-1 text-xs text-ink-dim">
        <Emoji name="lock" size={13} /> Locked
      </span>
    )
  if (cleared)
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-term/40 bg-term/10 px-3 py-1 text-xs text-term">
        <Emoji name="trophy" size={13} /> Cleared
      </span>
    )
  return <span className="rounded-full border border-cyan/40 bg-cyan/10 px-3 py-1 text-xs text-cyan">In progress</span>
}

function LevelCard({
  ch,
  accent,
  locked,
  stars,
  onPlay,
}: {
  ch: Challenge
  accent: string
  locked: boolean
  stars: number
  onPlay: () => void
}) {
  const isBoss = ch.kind === 'boss'
  return (
    <button
      disabled={locked}
      onClick={onPlay}
      className={`flex flex-col gap-1.5 rounded-lg border p-3 text-left transition-all ${
        locked
          ? 'cursor-not-allowed border-border bg-panel-2/30 opacity-50'
          : 'border-border bg-panel-2/50 hover:-translate-y-0.5 hover:border-term'
      } ${isBoss ? 'ring-1 ring-magenta/40' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${isBoss ? 'text-magenta' : 'text-ink'}`}>
          {isBoss && <span className="mr-1">☠</span>}
          {ch.title}
        </span>
        {locked && <Emoji name="lock" size={13} />}
      </div>
      {!locked && (stars > 0 ? <StarRow value={stars} size={14} /> : <span className="text-[11px]" style={{ color: accent }}>▶ play</span>)}
    </button>
  )
}
