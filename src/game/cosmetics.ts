/**
 * Cosmetics — the "Customize" economy (ported from Vimersion, adapted to
 * Tmuxpert's emoji mascot). Three kinds: an avatar (your mascot face), a theme
 * (the app-wide accent color), and a background (the animated backdrop). Free
 * items (price 0) are owned from the start; the rest are bought with coins
 * earned by playing.
 */
export type CosmeticKind = 'avatar' | 'theme' | 'background'

export interface Cosmetic {
  id: string
  kind: CosmeticKind
  name: string
  price: number // 0 = free / owned by default
  // avatar payload — an emoji name (see src/ui/emoji.ts)
  emoji?: string
  // theme payload — overrides the primary accent app-wide
  accent?: string
  accentDim?: string
  // background payload — key consumed by <Background/>
  bg?: string
  blurb?: string
}

/** Mascot faces (your "Muxie" companion, shown on Home and in the play sidebar). */
export const AVATARS: Cosmetic[] = [
  { id: 'robot', kind: 'avatar', name: 'Muxie', price: 0, emoji: 'robot', blurb: 'The original.' },
  { id: 'cat', kind: 'avatar', name: 'Cat', price: 30, emoji: 'cat', blurb: 'Nine lives, one prefix.' },
  { id: 'fox', kind: 'avatar', name: 'Fox', price: 30, emoji: 'fox', blurb: 'Quick on the keys.' },
  { id: 'ghost', kind: 'avatar', name: 'Ghost', price: 40, emoji: 'ghost', blurb: 'Detaches without a trace.' },
  { id: 'alien', kind: 'avatar', name: 'Alien', price: 60, emoji: 'alien', blurb: 'From a distant session.' },
  { id: 'wizard', kind: 'avatar', name: 'Wizard', price: 80, emoji: 'wizard', blurb: 'Commands the command line.' },
  { id: 'ninja', kind: 'avatar', name: 'Ninja', price: 90, emoji: 'ninja', blurb: 'Zero wasted keystrokes.' },
  { id: 'dragon', kind: 'avatar', name: 'Dragon', price: 120, emoji: 'dragon', blurb: 'Hoards windows.' },
]

/** Color themes — override the primary accent app-wide (UI + surface cursor). */
export const THEMES: Cosmetic[] = [
  { id: 'tmux-green', kind: 'theme', name: 'tmux Green', price: 0, accent: '#3ddc84', accentDim: '#2ba86a' },
  { id: 'nightglass', kind: 'theme', name: 'Nightglass', price: 0, accent: '#7c6bff', accentDim: '#5a4cd6' },
  { id: 'amber', kind: 'theme', name: 'Amber CRT', price: 60, accent: '#ffb454', accentDim: '#c98a3c' },
  { id: 'cyan', kind: 'theme', name: 'Ice Cyan', price: 60, accent: '#59c2ff', accentDim: '#3d87b3' },
  { id: 'magenta', kind: 'theme', name: 'Hot Magenta', price: 70, accent: '#ff6ac1', accentDim: '#b34d8a' },
  { id: 'crimson', kind: 'theme', name: 'Crimson', price: 70, accent: '#ff5c7a', accentDim: '#b34155' },
  { id: 'gold', kind: 'theme', name: 'Solid Gold', price: 100, accent: '#ffd54a', accentDim: '#c9a838' },
  { id: 'violet', kind: 'theme', name: 'Ultraviolet', price: 100, accent: '#b78cff', accentDim: '#7d5fb3' },
]

/** Animated backgrounds. CRT Scanlines is the free default; Synthwave is the
 *  other free option. The rest are unlockable. */
export const BACKGROUNDS: Cosmetic[] = [
  { id: 'crt', kind: 'background', name: 'CRT Scanlines', price: 0, bg: 'crt', blurb: 'Cozy terminal glow.' },
  { id: 'synthwave', kind: 'background', name: 'Synthwave', price: 0, bg: 'synthwave', blurb: 'Sunset & neon grid.' },
  { id: 'aurora', kind: 'background', name: 'Aurora', price: 70, bg: 'aurora', blurb: 'Drifting parallax light.' },
  { id: 'nebula', kind: 'background', name: 'Nebula', price: 120, bg: 'nebula', blurb: 'Deep-space color clouds.' },
  { id: 'matrix', kind: 'background', name: 'Digital Rain', price: 150, bg: 'matrix', blurb: 'Follow the white rabbit.' },
]

export const COSMETICS: Cosmetic[] = [...AVATARS, ...THEMES, ...BACKGROUNDS]
export const COSMETIC_BY_ID: Record<string, Cosmetic> = Object.fromEntries(COSMETICS.map((c) => [c.id, c]))

export const DEFAULTS = { avatar: 'robot', theme: 'tmux-green', background: 'crt' } as const

/** Everything free — owned from the first launch. */
export const FREE_COSMETICS: string[] = COSMETICS.filter((c) => c.price === 0).map((c) => c.id)

export type HeroEffect = 'sparkles' | 'fire' | 'bolt'

export const HERO_EFFECTS: { id: HeroEffect; name: string; emoji: string }[] = [
  { id: 'sparkles', name: 'Sparkles', emoji: 'sparkles' },
  { id: 'fire', name: 'Fire', emoji: 'fire' },
  { id: 'bolt', name: 'Bolt', emoji: 'bolt' },
]

export function cosmeticsByKind(kind: CosmeticKind): Cosmetic[] {
  return COSMETICS.filter((c) => c.kind === kind)
}
