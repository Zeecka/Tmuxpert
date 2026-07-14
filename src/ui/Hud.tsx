import { Emoji } from './Emoji'
import { XPBar } from './XPBar'
import { useGame } from '../game/store'

interface Props {
  onHome: () => void
  onMap: () => void
  onArcade: () => void
  onCustomize: () => void
}

export function Hud({ onHome, onMap, onArcade, onCustomize }: Props) {
  const coins = useGame((s) => s.coins)
  const streak = useGame((s) => s.streak.count)
  const soundOn = useGame((s) => s.soundOn)
  const toggleSound = useGame((s) => s.toggleSound)

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-panel/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
        <button onClick={onHome} className="flex items-center gap-2" title="Home">
          <img src="./tmux-logo.svg" width={26} height={26} alt="" draggable={false} />
          <span className="font-terminal text-lg font-bold text-ink">
            <span className="text-term">:</span>Tmuxpert
          </span>
        </button>

        <nav className="ml-2 hidden gap-1 sm:flex">
          <NavButton onClick={onMap} label="Campaign" />
          <NavButton onClick={onArcade} label="Prefix Rush" />
          <NavButton onClick={onCustomize} label="Customize" />
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <XPBar />
          {streak > 0 && (
            <span className="hidden items-center gap-1 text-sm text-amber sm:inline-flex" title="Daily streak">
              <Emoji name="fire" size={15} /> {streak}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-sm tabular-nums text-amber" title="Coins">
            <span className="coin" /> {coins}
          </span>
          <button
            onClick={toggleSound}
            className="rounded-full border border-border p-1.5 text-ink-dim transition-colors hover:border-term hover:text-term"
            title={soundOn ? 'Mute' : 'Unmute'}
          >
            <Emoji name={soundOn ? 'sound-on' : 'mute'} size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}

function NavButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border border-border px-3 py-1 text-sm text-ink-dim transition-colors hover:border-term hover:text-term"
    >
      {label}
    </button>
  )
}
