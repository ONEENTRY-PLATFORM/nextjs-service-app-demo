import { gsap } from 'gsap';

import type { HeroElements } from './heroRoles';

/** The two scrubbed timelines the hero parallax runs on. */
export interface HeroScrollTimelines {
  /** Background: fades and scales up as the hero scrolls away */
  bgTl: gsap.core.Timeline;
  /** Text and CTA: drift up, fade and scale as the hero scrolls away */
  triggerTl: gsap.core.Timeline;
}

/**
 * buildHeroScrollTimelines — the scroll parallax of the hero: the background
 * drifts on its own scrubbed timeline while the kicker, title, description and
 * CTA share a second one, so the two can be scrubbed at different rates.
 *
 * Every element is optional — a hero renders whichever parts its page provides,
 * and a missing role is simply not tweened.
 * @param   {object}              input          - Input
 * @param   {Element}             input.trigger  - Hero container that drives both ScrollTriggers
 * @param   {HeroElements}        input.elements - The hero's animated elements by role
 * @returns {HeroScrollTimelines}                The paused, scroll-driven timelines
 */
export const buildHeroScrollTimelines = ({
  trigger,
  elements,
}: {
  trigger: Element;
  elements: HeroElements;
}): HeroScrollTimelines => {
  const { kicker, title, description, bg, button } = elements;

  const bgTl = gsap.timeline({
    id: 'heroBgTl',
    paused: true,
    scrollTrigger: {
      trigger,
      scrub: 5,
      toggleActions: 'play reverse restart reverse',
      start: '10% top',
      end: 'bottom center',
    },
  });

  const triggerTl = gsap.timeline({
    id: 'heroTriggerTl',
    paused: true,
    scrollTrigger: {
      trigger,
      scrub: 3,
      toggleActions: 'play reverse restart reverse',
      start: '130px top',
      end: 'bottom center',
    },
  });

  if (title) {
    triggerTl.fromTo(
      title,
      { y: '0', autoAlpha: 1, scale: 1 },
      {
        y: '-5vh',
        autoAlpha: 0.5,
        scale: 1.3,
        ease: 'none',
        duration: 2,
        id: 'title',
      },
    );
  }

  if (description) {
    triggerTl.fromTo(
      description,
      { y: '0', autoAlpha: 1, scale: 1 },
      {
        y: '-10vh',
        autoAlpha: 0.5,
        scale: 0.8,
        ease: 'none',
        duration: 1.5,
        id: 'descr',
      },
      '-=1.5',
    );
  }

  if (button) {
    triggerTl.to(
      button,
      { autoAlpha: 0, duration: 1, ease: 'expo.inOut', id: 'button' },
      '-=1.5',
    );
  }

  /** kicker — runs in parallel with the title (absolute position 0) */
  if (kicker) {
    triggerTl.fromTo(
      kicker,
      { y: '0', autoAlpha: 1, scale: 1 },
      {
        y: '-5vh',
        autoAlpha: 0.5,
        scale: 1.1,
        ease: 'none',
        duration: 2,
        id: 'kicker',
      },
      0,
    );
  }

  if (bg) {
    bgTl.fromTo(
      bg,
      { autoAlpha: 1, scale: 1 },
      {
        autoAlpha: 0.5,
        scale: 1.2,
        ease: 'none',
        duration: 2,
        delay: 0.25,
        id: 'bg',
      },
    );
  }

  return { bgTl, triggerTl };
};
