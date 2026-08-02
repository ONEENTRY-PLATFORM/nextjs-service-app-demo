import type { HeroElementRegistry, HeroElements } from './heroRoles';

/**
 * collectHeroElements — flattens the live role registry into plain element lists
 * for the timeline builders, dropping the registration keys they do not need.
 * @param   {HeroElementRegistry} registry - Live per-role registry filled by the callback refs
 * @returns {HeroElements}                 The registered elements of every role
 */
export const collectHeroElements = (
  registry: HeroElementRegistry,
): HeroElements => ({
  bg: [...registry.bg.values()],
  kicker: [...registry.kicker.values()],
  title: [...registry.title.values()],
  description: [...registry.description.values()],
  button: [...registry.button.values()],
});
