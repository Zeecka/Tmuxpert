import { BINDINGS, CATEGORY_ORDER, type Binding } from '../tmux/catalog'
import { MASTERY_THRESHOLD, useGame } from '../game/store'
import { useT } from '../game/i18n'

/**
 * The Binding Belt - every tmux binding the game teaches, grouped by category,
 * lighting up as you master it (>= MASTERY_THRESHOLD reps). The tmux analog of
 * VimLegends's Command Belt, and deliberately the same design: a compact row of
 * keycaps per category, so the belt reads as one collection at a glance rather
 * than a wall of chips. (Octalysis "Ownership" drive.)
 */
export function BindingBelt() {
  const mastery = useGame((s) => s.mastery)
  const t = useT()
  const mastered = BINDINGS.filter((b) => (mastery[b.id] ?? 0) >= MASTERY_THRESHOLD).length

  const groups = CATEGORY_ORDER.map((cat) => ({
    key: cat,
    label: t(`belt.cat.${cat}`, undefined, cat),
    bindings: BINDINGS.filter((b) => b.category === cat),
  })).filter((g) => g.bindings.length > 0)

  const cap = (b: Binding) => {
    const reps = mastery[b.id] ?? 0
    const isMastered = reps >= MASTERY_THRESHOLD
    const started = reps > 0
    const label = t(`binding.${b.id}.label`, undefined, b.label)
    return (
      <span
        key={b.id}
        title={`${b.keys} — ${label}${reps ? ` (${reps})` : ''}`}
        className={`keycap ${isMastered ? 'border-term text-term' : started ? 'text-ink' : 'opacity-35'}`}
        style={isMastered ? { boxShadow: '0 0 8px color-mix(in srgb, var(--color-term) 40%, transparent)' } : undefined}
      >
        {b.keys}
      </span>
    )
  }

  return (
    <div className="panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-terminal text-xl font-semibold text-term">{t('belt.title')}</h3>
        <span className="text-xs tabular-nums text-ink-dim">
          {t('belt.mastered', { n: mastered, total: BINDINGS.length })}
        </span>
      </div>
      <div className="space-y-2.5">
        {groups.map((g) => (
          <div key={g.key} className="flex flex-wrap items-baseline gap-1.5">
            <span className="w-full text-[10px] uppercase tracking-widest text-ink-dim sm:w-24 sm:shrink-0">
              {g.label}
            </span>
            {g.bindings.map(cap)}
          </div>
        ))}
      </div>
    </div>
  )
}
