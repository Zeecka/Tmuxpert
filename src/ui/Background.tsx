/**
 * Animated CSS backgrounds (the WebGL tier is deferred). The equipped cosmetic
 * picks the scene. Retro-terminal / synthwave feel behind the smoked-glass chrome.
 */
import { useGame } from '../game/store'
import { COSMETIC_BY_ID } from '../game/cosmetics'

export function Background() {
  const bgId = useGame((s) => s.equipped.background)
  const bg = COSMETIC_BY_ID[bgId]?.bg ?? 'crt'
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg">
      {bg === 'synthwave' ? (
        <Synthwave />
      ) : bg === 'aurora' ? (
        <Aurora />
      ) : bg === 'nebula' ? (
        <Nebula />
      ) : bg === 'matrix' ? (
        <Matrix />
      ) : (
        <Crt />
      )}
    </div>
  )
}

function Crt() {
  return (
    <>
      <div
        className="tx-anim absolute -left-1/4 top-[-10%] h-[60vh] w-[60vh] rounded-full opacity-25 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--color-term), transparent 65%)', animation: 'tx-aurora-drift 26s ease-in-out infinite' }}
      />
      <div
        className="tx-anim absolute right-[-15%] bottom-[-15%] h-[55vh] w-[55vh] rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--color-cyan), transparent 65%)', animation: 'tx-aurora-drift 34s ease-in-out infinite reverse' }}
      />
      <div
        className="tx-anim absolute inset-x-0 bottom-0 h-1/2 opacity-[0.12]"
        style={{
          backgroundImage: 'linear-gradient(var(--color-term) 1px, transparent 1px), linear-gradient(90deg, var(--color-term) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          transform: 'perspective(360px) rotateX(62deg)',
          transformOrigin: 'bottom',
          animation: 'tx-grid-scroll 4s linear infinite',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, #000 0, #000 1px, transparent 1px, transparent 3px)' }}
      />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 90% at 50% 0%, transparent 55%, var(--color-bg) 100%)' }} />
    </>
  )
}

function Synthwave() {
  return (
    <>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #180b2e 0%, #2d1b4e 34%, #6b2d5c 60%, #c94b7b 80%, #ff9e64 100%)' }} />
      {/* striped sun */}
      <div
        className="absolute left-1/2 top-[24%] h-52 w-52 -translate-x-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle, #ffe66d 0%, #ff6ac1 60%, transparent 72%)',
          maskImage: 'repeating-linear-gradient(0deg, #000 0 10px, transparent 10px 15px)',
          WebkitMaskImage: 'repeating-linear-gradient(0deg, #000 0 10px, transparent 10px 15px)',
          filter: 'blur(0.5px)',
        }}
      />
      {/* neon grid floor */}
      <div
        className="tx-anim absolute inset-x-0 bottom-0 h-1/2 opacity-40"
        style={{
          backgroundImage: 'linear-gradient(#ff6ac1 1px, transparent 1px), linear-gradient(90deg, #ff6ac1 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          transform: 'perspective(340px) rotateX(66deg)',
          transformOrigin: 'bottom',
          animation: 'tx-grid-scroll 3.5s linear infinite',
        }}
      />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 90% at 50% 100%, transparent 55%, #0b0d14 100%)' }} />
    </>
  )
}

function Aurora() {
  return (
    <>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #060a16, #0a0e14)' }} />
      <div className="tx-anim absolute left-[10%] top-[10%] h-[55vh] w-[55vh] rounded-full opacity-40 blur-3xl" style={{ background: 'radial-gradient(circle, #3ddc84, transparent 60%)', animation: 'tx-aurora-drift 24s ease-in-out infinite' }} />
      <div className="tx-anim absolute right-[8%] top-[24%] h-[50vh] w-[50vh] rounded-full opacity-35 blur-3xl" style={{ background: 'radial-gradient(circle, #59c2ff, transparent 60%)', animation: 'tx-aurora-drift 30s ease-in-out infinite reverse' }} />
      <div className="tx-anim absolute bottom-[-10%] left-[30%] h-[55vh] w-[55vh] rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, #b78cff, transparent 60%)', animation: 'tx-aurora-drift 36s ease-in-out infinite' }} />
    </>
  )
}

function Nebula() {
  return (
    <>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 28% 18%, #1e1b4b, #0a0e14 70%)' }} />
      <div className="tx-anim absolute left-[20%] top-[16%] h-[55vh] w-[55vh] rounded-full opacity-45 blur-3xl" style={{ background: 'radial-gradient(circle, #7c3aed, transparent 58%)', animation: 'tx-aurora-drift 32s ease-in-out infinite' }} />
      <div className="tx-anim absolute right-[16%] bottom-[10%] h-[50vh] w-[50vh] rounded-full opacity-40 blur-3xl" style={{ background: 'radial-gradient(circle, #db2777, transparent 58%)', animation: 'tx-aurora-drift 38s ease-in-out infinite reverse' }} />
      <div className="absolute left-1/2 top-[42%] h-40 w-40 -translate-x-1/2 rounded-full opacity-70 blur-2xl" style={{ background: 'radial-gradient(circle, #0ea5e9, transparent 62%)' }} />
    </>
  )
}

function Matrix() {
  return (
    <>
      <div className="absolute inset-0" style={{ background: '#04120a' }} />
      <div
        className="tx-anim absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent 0 8px, color-mix(in srgb, var(--color-term) 26%, transparent) 8px 9px, transparent 9px 17px), linear-gradient(180deg, color-mix(in srgb, var(--color-term) 22%, transparent), transparent 30%)',
          backgroundSize: '100% 100%, 100% 220px',
          animation: 'tx-grid-scroll 1.2s linear infinite',
        }}
      />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 90% at 50% 30%, transparent 45%, #04120a 100%)' }} />
    </>
  )
}
