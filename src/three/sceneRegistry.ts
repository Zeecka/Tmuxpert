import type { ComponentType } from 'react'

export interface LevelSceneProps {
  accent: string
}

/**
 * sceneIndex (CHALLENGES order) → 3D scene component, rendered by Stage3D while
 * playing that level. Must stay in lock-step with HAS_3D_SCENE in
 * sceneRegistry.meta.ts (the sync-bundle mirror CampaignMode reads).
 *
 * Empty for now: no tmux level has a bespoke 3D scene yet, so play falls through
 * to the equipped backdrop (three/backdrops.tsx) like every other screen.
 * Register a scene here — and add its index to HAS_3D_SCENE — to give a level its
 * own world. Note TmuxLegends frames play with the surface on the RIGHT and the Hero
 * panel on the LEFT, so a scene should keep its subject left or deep-background;
 * VimLegends's scenes assume the mirror image of that.
 */
export const SCENES_3D: Readonly<Record<number, ComponentType<LevelSceneProps>>> = {}
