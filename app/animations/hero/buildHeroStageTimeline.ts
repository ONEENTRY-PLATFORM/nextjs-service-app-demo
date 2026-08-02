import { gsap } from 'gsap';

import type { HeroElements } from './heroRoles';

/**
 * buildHeroStageTimeline — the page-transition animation of the hero: its parts
 * drop in from above on arrival and lift back out on the way to the next route.
 *
 * Both directions are the same choreography played in opposite senses, so they
 * share one builder: `leaving` picks the outbound tweens. Every role is
 * optional — an empty one is simply not tweened — and a role holding several
 * elements (the home carousel's per-slide titles) has them all tweened as one.
 * @param   {object}             input          - Input
 * @param   {HeroElements}       input.elements - The hero's animated elements by role
 * @param   {boolean}            input.leaving  - `true` for the outbound animation
 * @returns {gsap.core.Timeline}                The paused stage timeline
 */
export const buildHeroStageTimeline = ({
  elements,
  leaving,
}: {
  elements: HeroElements;
  leaving: boolean;
}): gsap.core.Timeline => {
  const { kicker, title, description, bg, button } = elements;

  const stageTl = gsap.timeline({ id: 'heroStageTl', paused: true });

  if (!leaving) {
    if (bg.length > 0) {
      stageTl.fromTo(
        bg,
        { autoAlpha: 0.5, scale: 1.2 },
        { autoAlpha: 1, scale: 1, duration: 0.85, id: 'bg' },
      );
    }
    if (title.length > 0) {
      stageTl.fromTo(
        title,
        { autoAlpha: 0, y: '-20vh' },
        { y: '0', autoAlpha: 1, duration: 0.65, id: 'title' },
        '-=0.5',
      );
    }
    if (description.length > 0) {
      stageTl.fromTo(
        description,
        { autoAlpha: 0, y: '-20vh' },
        { y: '0', autoAlpha: 1, duration: 0.65, id: 'descr' },
        '-=0.5',
      );
    }
    /** kicker — revealed together with the title/description */
    if (kicker.length > 0) {
      stageTl.fromTo(
        kicker,
        { autoAlpha: 0, y: '-20vh' },
        { y: '0', autoAlpha: 1, duration: 0.65, id: 'kicker' },
        '-=0.5',
      );
    }
    if (button.length > 0) {
      stageTl.fromTo(
        button,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.35, ease: 'expo.inOut', id: 'button' },
        '-=0.5',
      );
    }
    return stageTl;
  }

  if (bg.length > 0) {
    stageTl.to(bg, { autoAlpha: 0.5, scale: 1.2 });
  }
  if (title.length > 0) {
    stageTl.to(
      title,
      { autoAlpha: 0, y: '-20vh', duration: 0.65, id: 'title' },
      '-=0.5',
    );
  }
  if (description.length > 0) {
    stageTl.to(description, { autoAlpha: 0, y: '-20vh' }, '-=0.5');
  }
  /** kicker — leaves together with the title/description */
  if (kicker.length > 0) {
    stageTl.to(kicker, { autoAlpha: 0, y: '-20vh' }, '-=0.5');
  }
  if (button.length > 0) {
    stageTl.to(button, { autoAlpha: 0 }, '-=0.5');
  }

  return stageTl;
};
