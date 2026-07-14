import { useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../game/store'
import { AVATARS, BACKGROUNDS, COSMETIC_BY_ID, HERO_EFFECTS, THEMES, type Cosmetic } from '../game/cosmetics'
import { sfx } from '../game/sound'
import { Emoji } from './Emoji'
import { HeroPanel } from './HeroPanel'

type TabKey = 'characters' | 'theme' | 'background'
const TABS: { key: TabKey; label: string }[] = [
  { key: 'characters', label: 'Characters' },
  { key: 'theme', label: 'Themes' },
  { key: 'background', label: 'Backgrounds' },
]

/** Cheap static snapshot of each live <Background/> scene, for the shop grid. */
function bgPreviewStyle(bg?: string): CSSProperties {
  switch (bg) {
    case 'synthwave':
      return { background: 'linear-gradient(180deg, #180b2e 0%, #2d1b4e 34%, #6b2d5c 60%, #c94b7b 80%, #ff9e64 100%)' }
    case 'aurora':
      return {
        background:
          'radial-gradient(circle at 24% 26%, #3ddc84, transparent 52%), radial-gradient(circle at 76% 36%, #59c2ff, transparent 52%), radial-gradient(circle at 52% 96%, #b78cff, transparent 56%), linear-gradient(180deg, #060a16, #0a0e14)',
      }
    case 'nebula':
      return {
        background:
          'radial-gradient(circle at 30% 26%, #7c3aed, transparent 55%), radial-gradient(circle at 74% 68%, #db2777, transparent 55%), radial-gradient(circle at 56% 48%, #0ea5e9, transparent 60%), radial-gradient(ellipse at 28% 18%, #1e1b4b, #0a0e14 70%)',
      }
    case 'matrix':
      return {
        background:
          'repeating-linear-gradient(90deg, transparent 0 6px, color-mix(in srgb, var(--color-term) 24%, transparent) 6px 7px, transparent 7px 13px), linear-gradient(180deg, color-mix(in srgb, var(--color-term) 16%, transparent), transparent 58%), #04120a',
      }
    case 'crt':
    default:
      return {
        background:
          'radial-gradient(ellipse at 50% -20%, color-mix(in srgb, var(--color-term) 30%, transparent), transparent 62%), repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,0,0,0.28) 3px, transparent 4px), radial-gradient(ellipse at 50% -15%, #10161f, #070a11 72%)',
      }
  }
}

function ItemPreview({ c }: { c: Cosmetic }) {
  if (c.kind === 'avatar') {
    return (
      <div className="grid h-20 place-items-center rounded bg-panel-2">
        <Emoji name={c.emoji ?? 'robot'} size={44} />
      </div>
    )
  }
  if (c.kind === 'theme') {
    return <div className="h-20 rounded" style={{ background: `linear-gradient(135deg, ${c.accent}, ${c.accentDim})` }} />
  }
  return <div className="h-20 overflow-hidden rounded" style={bgPreviewStyle(c.bg)} />
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex cursor-pointer flex-col items-center gap-1 text-[10px] uppercase tracking-widest text-ink-dim">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-12 cursor-pointer rounded border border-border bg-panel-2"
        aria-label={`${label} color`}
      />
      {label}
    </label>
  )
}

/** Muxie's aura customizer: live preview + color / effect / intensity controls. */
function AuraStudio() {
  const hero = useGame((s) => s.hero)
  const setHero = useGame((s) => s.setHero)
  const theme = useGame((s) => s.equipped.theme)

  const accent = COSMETIC_BY_ID[theme]?.accent ?? '#3ddc84'
  const auraColor = hero.color ?? accent
  const customized = hero.color !== null || hero.effect !== 'sparkles' || hero.intensity !== 0.6

  return (
    <div className="panel mt-5 p-4 sm:p-5">
      <p className="text-sm text-ink-dim">Style Muxie’s aura — it follows you everywhere you play.</p>
      <div className="mt-4 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <div className="w-full max-w-[15rem] shrink-0">
          <HeroPanel reaction="idle" />
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-ink-dim">Aura</div>
            <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-3">
              <ColorField label="Color" value={auraColor} onChange={(v) => setHero({ color: v })} />
              <div className="flex flex-wrap gap-1.5">
                {HERO_EFFECTS.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      setHero({ effect: a.id })
                      sfx.ui()
                    }}
                    className={`flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
                      hero.effect === a.id ? 'border-term text-term' : 'border-border text-ink-dim hover:text-ink'
                    }`}
                  >
                    <Emoji name={a.emoji} size={14} /> {a.name}
                  </button>
                ))}
              </div>
              <label className="flex min-w-[130px] flex-1 flex-col gap-1 text-[10px] uppercase tracking-widest text-ink-dim">
                Intensity
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={hero.intensity}
                  onChange={(e) => setHero({ intensity: Number(e.target.value) })}
                  style={{ accentColor: 'var(--color-term)' }}
                  aria-label="Aura intensity"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              disabled={!customized}
              onClick={() => {
                sfx.ui()
                setHero({ color: null, effect: 'sparkles', intensity: 0.6 })
              }}
              className={`rounded border border-border px-3 py-1.5 text-xs transition-colors ${
                customized ? 'text-ink-dim hover:border-term hover:text-term' : 'cursor-not-allowed opacity-40'
              }`}
            >
              reset aura
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CosmeticGrid({ items }: { items: Cosmetic[] }) {
  const coins = useGame((s) => s.coins)
  const owned = useGame((s) => s.owned)
  const equipped = useGame((s) => s.equipped)
  const buy = useGame((s) => s.buyItem)
  const equip = useGame((s) => s.equipItem)

  const onBuy = (c: Cosmetic) => {
    if (buy(c.id)) {
      sfx.levelUp()
      equip(c.id) // auto-equip on purchase
    } else sfx.error()
  }

  return (
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((c) => {
        const isOwned = owned.includes(c.id)
        const isEquipped = equipped[c.kind] === c.id
        const canAfford = coins >= c.price
        return (
          <motion.div key={c.id} layout className="panel flex flex-col p-3">
            <ItemPreview c={c} />
            <div className="mt-2 flex-1">
              <p className="text-sm font-medium text-ink">{c.name}</p>
              {c.blurb && <p className="text-[11px] leading-snug text-ink-dim">{c.blurb}</p>}
            </div>
            <div className="mt-3">
              {isEquipped ? (
                <div className="rounded py-1.5 text-center text-xs font-bold text-term" style={{ background: 'color-mix(in srgb, var(--color-term) 15%, transparent)' }}>
                  ✓ Equipped
                </div>
              ) : isOwned ? (
                <button
                  onClick={() => {
                    equip(c.id)
                    sfx.ui()
                  }}
                  className="w-full rounded border border-term py-1.5 text-xs font-bold text-term transition-colors hover:bg-term/10"
                >
                  Equip
                </button>
              ) : (
                <button
                  disabled={!canAfford}
                  onClick={() => onBuy(c)}
                  className={`flex w-full items-center justify-center gap-1.5 rounded py-1.5 text-xs font-bold transition-transform ${
                    canAfford ? 'btn-accent hover:scale-[1.03]' : 'cursor-not-allowed bg-panel-2 text-ink-dim'
                  }`}
                >
                  <span className="coin" /> {c.price}
                </button>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export function Shop() {
  const coins = useGame((s) => s.coins)
  const [tab, setTab] = useState<TabKey>('characters')
  const items = tab === 'theme' ? THEMES : tab === 'background' ? BACKGROUNDS : AVATARS

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-terminal text-4xl text-term glow-term">Customize</h2>
          <p className="mt-1 text-ink-dim">Earn coins by playing. Spend them on your look.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="coin" style={{ width: '1.4em', height: '1.4em' }} />
          <span className="font-terminal text-3xl tabular-nums text-amber">{coins}</span>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key)
              sfx.ui()
            }}
            className={`rounded border px-4 py-1.5 text-sm transition-colors ${
              tab === t.key ? 'border-term text-term' : 'border-border text-ink-dim hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <CosmeticGrid items={items} />
      {tab === 'characters' && <AuraStudio />}
    </div>
  )
}
