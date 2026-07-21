/** Roles of the hero elements the animation timeline drives. */
export type HeroRole = 'bg' | 'kicker' | 'title' | 'description' | 'button';

/** The hero's animated elements, resolved from their callback refs. */
export type HeroElements = Record<HeroRole, Element | null>;
