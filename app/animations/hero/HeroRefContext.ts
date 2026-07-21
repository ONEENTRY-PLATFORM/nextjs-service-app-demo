'use client';

import { createContext } from 'react';

import type { HeroRole } from './heroRoles';

/**
 * Registration factory published by `HeroAnimations`: a hero part calls it with
 * its role and attaches the returned callback ref, so the wrapper collects the
 * elements it animates without querying the DOM by class name.
 *
 * Outside a `HeroAnimations` wrapper it hands back a no-op ref, so hero parts
 * stay usable (unanimated) on a page that has no wrapper.
 */
export const HeroRefContext = createContext<
  (role: HeroRole) => (el: Element | null) => void
>(() => () => {});
