import { KeyCap } from './atoms'
import { BINDINGS, CATEGORY_ORDER, type BindingCategory } from '../tmux/catalog'
import { MASTERY_THRESHOLD, useGame } from '../game/store'

/**
 * The Binding Belt — every tmux binding the game teaches, grouped by category,
 * lighting up as you master it (≥ MASTERY_THRESHOLD reps). The tmux analog of
 * Vimersion's Command Belt.
 */
export function BindingBelt() {
  const mastery = useGame((s) => s.mastery)
  const masteredCount = BINDINGS.filter((b) => (mastery[b.id] ?? 0) >= MASTERY_THRESHOLD).length

  const byCategory = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: BINDINGS.filter((b) => b.category === cat),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="panel p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="font-terminal text-lg text-ink">Binding Belt</h3>
        <span className="text-xs tabular-nums text-ink-dim">
          {masteredCount}/{BINDINGS.length} mastered
        </span>
      </div>
      <div className="mt-4 space-y-4">
        {byCategory.map(({ cat, items }) => (
          <CategoryRow key={cat} cat={cat} items={items} mastery={mastery} />
        ))}
      </div>
    </div>
  )
}

function CategoryRow({
  cat,
  items,
  mastery,
}: {
  cat: BindingCategory
  items: typeof BINDINGS
  mastery: Record<string, number>
}) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-dim">{cat}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((b) => {
          const reps = mastery[b.id] ?? 0
          const mastered = reps >= MASTERY_THRESHOLD
          return (
            <span
              key={b.id}
              title={`${b.label}${mastered ? ' — mastered' : reps ? ` — ${reps}/${MASTERY_THRESHOLD}` : ''}`}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors ${
                mastered ? 'border-term/50 bg-term/10 text-ink' : 'border-border bg-panel-2/40 text-ink-dim'
              }`}
            >
              <KeyCap>{b.keys}</KeyCap>
              <span className="hidden sm:inline">{b.label}</span>
              {mastered && <span className="text-term">✓</span>}
            </span>
          )
        })}
      </div>
    </div>
  )
}
