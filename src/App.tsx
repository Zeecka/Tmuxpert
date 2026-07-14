import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Background } from './ui/Background'
import { Hud } from './ui/Hud'
import { BindingBelt } from './ui/BindingBelt'
import { WorldMap } from './ui/WorldMap'
import { Shop } from './ui/Shop'
import { Emoji } from './ui/Emoji'
import { CampaignMode } from './modes/CampaignMode'
import { ArcadeMode } from './modes/ArcadeMode'
import { useGame, MASTERY_THRESHOLD } from './game/store'
import { setSoundMuted } from './game/sound'
import { levelFromXp } from './game/xp'
import { BINDINGS } from './tmux/catalog'
import { COSMETIC_BY_ID } from './game/cosmetics'
import { CHALLENGES, CHALLENGE_BY_ID, nextChallengeId } from './content/tiers'

type Screen = { name: 'home' } | { name: 'map' } | { name: 'play'; id: string } | { name: 'arcade' } | { name: 'shop' }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const soundOn = useGame((s) => s.soundOn)
  const equipped = useGame((s) => s.equipped)

  const theme = COSMETIC_BY_ID[equipped.theme]
  const accent = theme?.accent ?? '#3ddc84'
  const accentDim = theme?.accentDim ?? '#2ba86a'

  // Keep the SFX engine's mute flag in sync with the persisted setting.
  useEffect(() => {
    setSoundMuted(!soundOn)
  }, [soundOn])

  // The whole UI recolors from one variable — swap the accent when a theme is
  // equipped (mirrors Vimersion).
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--color-term', accent)
    root.style.setProperty('--color-term-dim', accentDim)
  }, [accent, accentDim])

  const go = {
    home: () => setScreen({ name: 'home' }),
    map: () => setScreen({ name: 'map' }),
    arcade: () => setScreen({ name: 'arcade' }),
    shop: () => setScreen({ name: 'shop' }),
    play: (id: string) => setScreen({ name: 'play', id }),
  }

  return (
    <div className="min-h-full">
      <Background />
      <Hud onHome={go.home} onMap={go.map} onArcade={go.arcade} onCustomize={go.shop} />

      <AnimatePresence mode="wait">
        <motion.main
          key={screen.name === 'play' ? `play-${screen.id}` : screen.name}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="relative z-10"
        >
          {screen.name === 'home' && (
            <Home onContinue={() => go.play(nextChallengeId(useGame.getState().completed))} onMap={go.map} onArcade={go.arcade} onCustomize={go.shop} />
          )}
          {screen.name === 'map' && <WorldMap onPlay={go.play} />}
          {screen.name === 'arcade' && <ArcadeMode />}
          {screen.name === 'shop' && <Shop />}
          {screen.name === 'play' &&
            (CHALLENGE_BY_ID[screen.id] ? (
              <CampaignMode challenge={CHALLENGE_BY_ID[screen.id]} onPlay={go.play} onMap={go.map} />
            ) : (
              <div className="p-10 text-center text-ink-dim">Unknown level.</div>
            ))}
        </motion.main>
      </AnimatePresence>
    </div>
  )
}

function Home({
  onContinue,
  onMap,
  onArcade,
  onCustomize,
}: {
  onContinue: () => void
  onMap: () => void
  onArcade: () => void
  onCustomize: () => void
}) {
  const xp = useGame((s) => s.xp)
  const completed = useGame((s) => s.completed)
  const mastery = useGame((s) => s.mastery)
  const streak = useGame((s) => s.streak.count)
  const arcadeBest = useGame((s) => s.arcadeBest)
  const avatar = useGame((s) => s.equipped.avatar)

  const level = levelFromXp(xp)
  const solved = Object.keys(completed).length
  const mastered = BINDINGS.filter((b) => (mastery[b.id] ?? 0) >= MASTERY_THRESHOLD).length
  const avatarEmoji = COSMETIC_BY_ID[avatar]?.emoji ?? 'robot'

  const stats: { label: string; value: string; color: string }[] = [
    { label: 'Level', value: String(level), color: 'var(--color-term)' },
    { label: 'Solved', value: `${solved}/${CHALLENGES.length}`, color: 'var(--color-cyan)' },
    { label: 'Mastered', value: `${mastered}/${BINDINGS.length}`, color: 'var(--color-magenta)' },
    { label: 'Streak', value: String(streak), color: 'var(--color-amber)' },
    { label: 'Rush best', value: String(arcadeBest), color: 'var(--color-term)' },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-col items-center text-center">
        <div className="grid h-24 w-24 place-items-center rounded-full border border-term/40 bg-panel-2 shadow-[0_0_40px_-8px_var(--color-term)]">
          <Emoji name={avatarEmoji} size={52} />
        </div>
        <h1 className="title-gradient mt-5 font-terminal text-6xl font-bold sm:text-7xl">
          <span className="text-term">:</span>Tmuxpert
        </h1>
        <p className="mt-2 text-ink-dim">Learn tmux by playing — real prefix-key challenges, no config to memorize.</p>

        <div className="mt-8 grid w-full grid-cols-2 gap-2.5 sm:grid-cols-5">
          {stats.map((s) => (
            <div key={s.label} className="panel px-3 py-3" style={{ borderTopColor: s.color, borderTopWidth: 2 }}>
              <div className="font-terminal text-2xl text-ink">{s.value}</div>
              <div className="text-[11px] uppercase tracking-wider text-ink-dim">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button onClick={onContinue} className="btn-primary rounded-xl px-6 py-3 font-bold">
            {solved === 0 ? 'Start campaign' : 'Continue campaign'}
          </button>
          <button
            onClick={onMap}
            className="rounded-xl border border-border px-5 py-3 text-ink-dim transition-colors hover:border-term hover:text-term"
          >
            World map
          </button>
          <button onClick={onArcade} className="btn-accent rounded-xl px-6 py-3 font-bold">
            Prefix Rush
          </button>
          <button
            onClick={onCustomize}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-5 py-3 text-ink-dim transition-colors hover:border-term hover:text-term"
          >
            <Emoji name="palette" size={16} /> Customize
          </button>
        </div>
      </div>

      <div className="mt-10">
        <BindingBelt />
      </div>
    </div>
  )
}
