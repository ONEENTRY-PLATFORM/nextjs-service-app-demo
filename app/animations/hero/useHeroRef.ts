'use client';

import { useCallback, useContext, useId } from 'react';

import { HeroRefContext } from './HeroRefContext';
import type { HeroRole } from './heroRoles';

/**
 * useHeroRef — returns a callback ref that registers its element under `role`
 * with the enclosing `HeroAnimations`, so the hero timeline animates it by
 * reference instead of by CSS-class lookup. Attach it to the matching hero
 * element (`bg` image wrapper, `kicker` / `title` / `description` text, `button`).
 * Used by the small leaf wrappers (`HeroBg`, `HeroKicker`, `HeroTitle`,
 * `HeroDescription`) and directly by the home `HeroSlider` for its background
 * and call-to-action.
 *
 * Several components may hold the same role — the home carousel renders a title
 * per slide — so each instance registers under its own `useId` key and the
 * timeline drives them all.
 * @param   {HeroRole}                     role - Which hero element this ref is
 * @returns {(el: Element | null) => void}      Callback ref to spread on the element
 */
export const useHeroRef = (role: HeroRole): ((el: Element | null) => void) => {
  const register = useContext(HeroRefContext);
  const key = useId();
  return useCallback(
    (el: Element | null) => {
      register(role, key)(el);
    },
    [register, role, key],
  );
};
