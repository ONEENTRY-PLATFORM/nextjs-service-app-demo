import { gsap } from 'gsap';

import type { HeroElements } from './heroRoles';

/**
 * buildHeroStageTimeline — the page-transition animation of the hero: its parts
 * drop in from above on arrival and lift back out on the way to the next route.
 *
 * Both directions are the same choreography played in opposite senses, so they
 * share one builder: `leaving` picks the outbound tweens. Every element is
 * optional — a missing role is simply not tweened.
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
    if (bg) {
      stageTl.fromTo(
        bg,
        { autoAlpha: 0.5, scale: 1.2 },
        { autoAlpha: 1, scale: 1, duration: 0.85, id: 'bg' },
      );
    }
    if (title) {
      stageTl.fromTo(
        title,
        { autoAlpha: 0, y: '-20vh' },
        { y: '0', autoAlpha: 1, duration: 0.65, id: 'title' },
        '-=0.5',
      );
    }
    if (description) {
      stageTl.fromTo(
        description,
        { autoAlpha: 0, y: '-20vh' },
        { y: '0', autoAlpha: 1, duration: 0.65, id: 'descr' },
        '-=0.5',
      );
    }
    /** kicker — revealed together with the title/description */
    if (kicker) {
      stageTl.fromTo(
        kicker,
        { autoAlpha: 0, y: '-20vh' },
        { y: '0', autoAlpha: 1, duration: 0.65, id: 'kicker' },
        '-=0.5',
      );
    }
    if (button) {
      stageTl.fromTo(
        button,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.35, ease: 'expo.inOut', id: 'button' },
        '-=0.5',
      );
    }
    return stageTl;
  }

  if (bg) {
    stageTl.to(bg, { autoAlpha: 0.5, scale: 1.2 });
  }
  if (title) {
    stageTl.to(
      title,
      { autoAlpha: 0, y: '-20vh', duration: 0.65, id: 'title' },
      '-=0.5',
    );
  }
  if (description) {
    stageTl.to(description, { autoAlpha: 0, y: '-20vh' }, '-=0.5');
  }
  /** kicker — leaves together with the title/description */
  if (kicker) {
    stageTl.to(kicker, { autoAlpha: 0, y: '-20vh' }, '-=0.5');
  }
  if (button) {
    stageTl.to(button, { autoAlpha: 0 }, '-=0.5');
  }

  return stageTl;
};
