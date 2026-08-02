'use client';

import { createContext } from 'react';

import type { HeroRole } from './heroRoles';

/**
 * Registration factory published by `HeroAnimations`: a hero part calls it with
 * its role and its own instance key, then attaches the returned callback ref, so
 * the wrapper collects the elements it animates without querying the DOM by
 * class name. The key keeps several parts sharing a role apart (the home
 * carousel registers a title per slide), since a detaching callback ref reports
 * only `null` and not which element it belonged to.
 *
 * Outside a `HeroAnimations` wrapper it hands back a no-op ref, so hero parts
 * stay usable (unanimated) on a page that has no wrapper.
 */
export const HeroRefContext = createContext<
  (role: HeroRole, key: string) => (el: Element | null) => void
>(() => () => {});
