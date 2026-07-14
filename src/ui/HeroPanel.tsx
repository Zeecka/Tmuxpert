import { motion } from 'framer-motion'
import { Emoji } from './Emoji'
import { XPBar } from './XPBar'
import { useGame } from '../game/store'
import { COSMETIC_BY_ID, HERO_EFFECTS } from '../game/cosmetics'

export type Reaction = 'idle' | 'typing' | 'win' | 'levelup' | 'fail'

// Reaction faces temporarily override the equipped avatar for expressive moments.
const REACTION_FACE: Partial<Record<Reaction, string>> = {
  win: 'party',
  levelup: 'starstruck',
  fail: 'cry',
  typing: 'thinking',
}

const LINE: Record<Reaction, string> = {
  idle: 'Prefix first, always.',
  typing: 'Nice — keep going…',
  win: 'Clean solve!',
  levelup: 'Level up! 🚀',
  fail: 'Shake it off — retry.',
}

/** Muxie — your companion. Face is the equipped avatar (with expressive reaction
 *  swaps), aura is customizable (color / effect / intensity) from Customize. */
export function HeroPanel({ reaction }: { reaction: Reaction }) {
  const avatar = useGame((s) => s.equipped.avatar)
  const hero = useGame((s) => s.hero)

  const baseFace = COSMETIC_BY_ID[avatar]?.emoji ?? 'robot'
  const face = REACTION_FACE[reaction] ?? baseFace
  const auraColor = hero.color ?? 'var(--color-term)'
  const effectEmoji = HERO_EFFECTS.find((e) => e.id === hero.effect)?.emoji ?? 'sparkles'
  const showParticles = hero.intensity > 0.05

  return (
    <div className="panel flex flex-col items-center gap-3 p-4">
      <div className="relative grid h-28 w-28 place-items-center">
        <div
          aria-hidden
          className="tx-anim absolute inset-0 rounded-full"
          style={{
            opacity: 0.35 + hero.intensity * 0.5,
            background: `conic-gradient(from 0deg, ${auraColor}, transparent 40%, var(--color-cyan), transparent 75%, ${auraColor})`,
            animation: 'tx-spin-slow 6s linear infinite',
            mask: 'radial-gradient(circle, transparent 58%, black 60%)',
            WebkitMask: 'radial-gradient(circle, transparent 58%, black 60%)',
          }}
        />

        {/* Rising effect particles. */}
        {showParticles &&
          [0, 1, 2].map((i) => (
            <span
              key={i}
              aria-hidden
              className="tx-anim absolute bottom-2"
              style={{
                left: `${28 + i * 22}%`,
                opacity: hero.intensity,
                animation: `tx-float ${2.4 + i * 0.4}s ease-in ${i * 0.8}s infinite`,
              }}
            >
              <Emoji name={effectEmoji} size={14} />
            </span>
          ))}

        <motion.div
          key={reaction}
          initial={{ scale: 0.7 }}
          animate={reaction === 'win' || reaction === 'levelup' ? { scale: [1, 1.18, 1], rotate: [0, -7, 7, 0] } : { scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 14 }}
          className="grid h-20 w-20 place-items-center rounded-full border border-border bg-panel-2"
        >
          <Emoji name={face} size={44} />
        </motion.div>
      </div>

      <div className="text-center">
        <p className="font-terminal text-lg text-ink">Muxie</p>
        <p className="text-[11px] text-ink-dim">your split-brain buddy</p>
      </div>

      <XPBar showNumbers={false} />

      <p className="min-h-[2.5em] text-center text-xs text-ink-dim">{LINE[reaction]}</p>
    </div>
  )
}
