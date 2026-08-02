/** Roles of the hero elements the animation timeline drives. */
export type HeroRole = 'bg' | 'kicker' | 'title' | 'description' | 'button';

/**
 * The hero's animated elements, resolved from their callback refs. A role holds
 * a list rather than a single element because a hero may render the same role
 * several times — the home carousel has a title per slide, each in a desktop and
 * a mobile variant — and the timeline drives every copy, so whichever one is on
 * screen is already in the right state.
 */
export type HeroElements = Record<HeroRole, Element[]>;

/**
 * The live registry behind {@link HeroElements}: every role maps the registering
 * component's id to its element, so an unmounting copy drops exactly its own
 * entry — a callback ref only reports `null`, never which element left.
 */
export type HeroElementRegistry = Record<HeroRole, Map<string, Element>>;
