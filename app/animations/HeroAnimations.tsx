'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useTransitionState } from 'next-transition-router';
import type { JSX, ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';

import { useAppSelector } from '@/app/store/hooks';

/** Roles of the hero elements the animation timeline drives. */
export type HeroRole = 'bg' | 'kicker' | 'title' | 'description' | 'button';

/**
 * Ref-registration context provided by {@link HeroAnimations}. The value is a
 * factory: `register(role)` returns the callback ref to attach to that element.
 */
const HeroRefContext = createContext<
  ((role: HeroRole) => (el: Element | null) => void) | null
>(null);

/**
 * useHeroRef — returns a callback ref that registers its element under `role`
 * with the enclosing {@link HeroAnimations}, so the hero timeline animates it by
 * reference instead of by CSS-class lookup. Attach it to the matching hero
 * element (`bg` image wrapper, `kicker` / `title` / `description` text, `button`).
 * Used by the small leaf wrappers (`HeroBg`, `HeroKicker`, `HeroTitle`,
 * `HeroDescription`) and directly by the home `HeroSlider` for its background.
 * @param   {HeroRole}                     role - Which hero element this ref is
 * @returns {(el: Element | null) => void}      Callback ref to spread on the element
 */
export const useHeroRef = (role: HeroRole): ((el: Element | null) => void) => {
  const register = useContext(HeroRefContext);
  return useCallback(
    (el: Element | null) => {
      register?.(role)(el);
    },
    [register, role],
  );
};

/**
 * HeroAnimations component for creating hero section animations.
 *
 * Drives the hero by element references collected through {@link useHeroRef}
 * (no `.hero-*` class lookups): a covering loader-reveal mask, a scroll parallax
 * on the background and text, and page-transition enter/leave animations.
 * @param   {object}      props           - The props for the HeroAnimations component.
 * @param   {ReactNode}   props.children  - The content to be wrapped with animations.
 * @param   {string}      props.className - The class name to be applied to the container.
 * @returns {JSX.Element}                 The JSX element for the hero section animations.
 */
const HeroAnimations = ({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}): JSX.Element => {
  const { stage } = useTransitionState();
  const ref = useRef<HTMLDivElement>(null);
  const readyState = useAppSelector(
    (state) => state.animationsSlice.readyState,
  );
  const [backTl, setBackTl] = useState<gsap.core.Timeline>();
  const [triggerTl, setTriggerTl] = useState<gsap.core.Timeline>();
  const [prevStage, setPrevStage] = useState<string>('');
  /**
   * Once this hero enters the `leaving` stage it is on its way out (the route
   * is unmounting it). While it lingers in the DOM the transition can flip to
   * `entering`, which would re-run the reveal and snap the covering overlay
   * back open. This latch keeps the overlay covering until unmount.
   */
  const hasLeftRef = useRef(false);

  /**
   * Hero element references keyed by role, populated by the `useHeroRef`
   * callback refs during commit (before the GSAP layout effects run).
   */
  const els = useRef<Record<HeroRole, Element | null>>({
    bg: null,
    kicker: null,
    title: null,
    description: null,
    button: null,
  });
  /** Stable ref-registration factory handed to the context consumers. */
  const register = useCallback(
    (role: HeroRole) => (el: Element | null) => {
      els.current[role] = el;
    },
    [],
  );

  /** triggerTl animations */
  useGSAP(
    () => {
      if (!ref.current) {
        return;
      }

      const kicker = els.current.kicker;
      const title = els.current.title;
      const description = els.current.description;
      const heroBg = els.current.bg;
      const button = els.current.button;

      /** bgTl */
      const bgTl = gsap.timeline({
        id: 'heroBgTl',
        paused: true,
        scrollTrigger: {
          trigger: ref.current,
          scrub: 5,
          toggleActions: 'play reverse restart reverse',
          start: '10% top',
          end: 'bottom center',
        },
      });
      /** triggerTl */
      const triggerTl = gsap.timeline({
        id: 'heroTriggerTl',
        paused: true,
        scrollTrigger: {
          trigger: ref.current,
          scrub: 3,
          toggleActions: 'play reverse restart reverse',
          start: '130px top',
          end: 'bottom center',
        },
      });
      setBackTl(bgTl);
      setTriggerTl(triggerTl);
      /** title */
      if (title) {
        triggerTl.fromTo(
          title,
          {
            y: '0',
            autoAlpha: 1,
            scale: 1,
          },
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
      /** descr */
      if (description) {
        triggerTl.fromTo(
          description,
          {
            y: '0',
            autoAlpha: 1,
            scale: 1,
          },
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
      /** button */
      if (button) {
        triggerTl.to(
          button,
          {
            autoAlpha: 0,
            duration: 1,
            ease: 'expo.inOut',
            id: 'button',
          },
          '-=1.5',
        );
      }
      /** kicker — runs in parallel with the title (absolute position 0) */
      if (kicker) {
        triggerTl.fromTo(
          kicker,
          {
            y: '0',
            autoAlpha: 1,
            scale: 1,
          },
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
      /** bgTl */
      if (heroBg) {
        bgTl.fromTo(
          heroBg,
          {
            autoAlpha: 1,
            scale: 1,
          },
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

      return () => {
        triggerTl.kill();
        bgTl.kill();
      };
    },
    { dependencies: [], scope: ref },
  );

  /** heroStageTl */
  useGSAP(() => {
    if (!ref.current || !readyState) {
      return;
    }

    /**
     * Already leaving — this hero only unmounts from here. `useGSAP` reverts
     * the previous (covering) context on every re-run, which snaps the mask
     * back open; re-apply the fully-covering path so the overlay stays closed
     * until unmount instead of flashing the header.
     */
    if (hasLeftRef.current) {
      gsap.set(ref.current.querySelectorAll('#hero_mask path'), {
        attr: { d: 'M0 1005S175 995 500 995s500 5 500 5V0H0Z' },
      });
      return;
    }

    const heroMask = ref.current.querySelectorAll('#hero_mask path');

    const kicker = els.current.kicker;
    const title = els.current.title;
    const description = els.current.description;
    const heroBg = els.current.bg;
    const button = els.current.button;

    const first = stage === 'none' && prevStage === '';
    const enter = stage === 'entering' && prevStage === 'leaving';
    const leaving = stage === 'leaving' && prevStage === 'none';

    /** stageTl */
    const stageTl = gsap.timeline({
      id: 'heroStageTl',
      paused: true,
    });

    /** loaderTl */
    const loaderTl = gsap.timeline({
      id: 'heroLoaderTl',
      paused: true,
      onComplete: () => {
        stageTl.play();
      },
    });

    /** if not leaving stage animate normal */
    if (!leaving) {
      /** bg */
      if (heroBg) {
        stageTl.fromTo(
          heroBg,
          {
            autoAlpha: 0.5,
            scale: 1.2,
          },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.85,
            id: 'bg',
          },
        );
      }
      /** stageTl title */
      if (title) {
        stageTl.fromTo(
          title,
          {
            autoAlpha: 0,
            y: '-20vh',
          },
          {
            y: '0',
            autoAlpha: 1,
            duration: 0.65,
            id: 'title',
          },
          '-=0.5',
        );
      }
      /** stageTl descr */
      if (description) {
        stageTl.fromTo(
          description,
          {
            autoAlpha: 0,
            y: '-20vh',
          },
          {
            y: '0',
            autoAlpha: 1,
            duration: 0.65,
            id: 'descr',
          },
          '-=0.5',
        );
      }
      /** stageTl kicker — revealed together with the title/description */
      if (kicker) {
        stageTl.fromTo(
          kicker,
          {
            autoAlpha: 0,
            y: '-20vh',
          },
          {
            y: '0',
            autoAlpha: 1,
            duration: 0.65,
            id: 'kicker',
          },
          '-=0.5',
        );
      }
      /** stageTl button */
      if (button) {
        stageTl.fromTo(
          button,
          {
            autoAlpha: 0,
          },
          {
            autoAlpha: 1,
            duration: 0.35,
            ease: 'expo.inOut',
            id: 'button',
          },
          '-=0.5',
        );
      }
    } else {
      /** bg */
      if (heroBg) {
        stageTl.to(heroBg, {
          autoAlpha: 0.5,
          scale: 1.2,
        });
      }
      /** title */
      if (title) {
        stageTl.to(
          title,
          {
            autoAlpha: 0,
            y: '-20vh',
            duration: 0.65,
            id: 'title',
          },
          '-=0.5',
        );
      }
      /** stageTl descr */
      if (description) {
        stageTl.to(
          description,
          {
            autoAlpha: 0,
            y: '-20vh',
          },
          '-=0.5',
        );
      }
      /** stageTl kicker — leaves together with the title/description */
      if (kicker) {
        stageTl.to(
          kicker,
          {
            autoAlpha: 0,
            y: '-20vh',
          },
          '-=0.5',
        );
      }
      /** stageTl button */
      if (button) {
        stageTl.to(
          button,
          {
            autoAlpha: 0,
          },
          '-=0.5',
        );
      }
    }

    /** first loading */
    if (first) {
      loaderTl
        .to(heroMask, {
          duration: 0.65,
          attr: { d: 'M0 502S175 272 500 272s500 230 500 230V0H0Z' },
          ease: 'power2.in',
        })
        .to(heroMask, {
          duration: 0.65,
          attr: { d: 'M0 2S175 1 500 1s500 1 500 1V0H0Z' },
          ease: 'power2.out',
        })
        .play();
    }
    // enter stage
    else if (enter) {
      loaderTl
        .to(heroMask, {
          duration: 0.65,
          attr: { d: 'M0 502S175 272 500 272s500 230 500 230V0H0Z' },
          ease: 'power2.in',
        })
        .to(heroMask, {
          duration: 0.65,
          attr: { d: 'M0 2S175 1 500 1s500 1 500 1V0H0Z' },
          ease: 'power2.out',
        })
        .play();
    }
    // leaving stage
    else if (leaving) {
      /** Latch: from here on this hero only unmounts — never reveal again */
      hasLeftRef.current = true;
      stageTl.play();
      backTl?.kill();
      triggerTl?.kill();

      if (heroBg) {
        stageTl.to([heroBg, '.bg-gradient-1'], {
          autoAlpha: 0,
          duration: 0.65,
        });
      }
      /**
       * Cover the header and hold it closed. Play the wave forward from the
       * open state to fully covering and stop there — the overlay must stay
       * closed as the page leaves, not reveal the header again.
       */
      loaderTl
        .set(heroMask, {
          attr: { d: 'M0 2S175 1 500 1s500 1 500 1V0H0Z' },
        })
        .to(heroMask, {
          attr: { d: 'M0 502S175 272 500 272s500 230 500 230V0H0Z' },
          duration: 0.5,
          ease: 'power2.in',
        })
        .to(heroMask, {
          attr: { d: 'M0 1005S175 995 500 995s500 5 500 5V0H0Z' },
          duration: 0.5,
          ease: 'power2.out',
        })
        .play();
    }

    setPrevStage(stage);

    return () => {
      stageTl.kill();
      loaderTl.kill();
    };
  }, [stage, readyState]);

  return (
    <div ref={ref} className={className}>
      {/* Decorative loader-reveal mask. `pointer-events-none` is required: its
          full-size <svg> box sits above the hero (z-50) and would otherwise
          swallow every click on the slider arrows, dots and CTA button. */}
      <svg
        id="hero_mask"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        className="pointer-events-none"
      >
        <path
          fill="#ffffff"
          className="mask_path"
          d="M0 1005S175 995 500 995s500 5 500 5V0H0Z"
        />
      </svg>
      <HeroRefContext.Provider value={register}>
        {children}
      </HeroRefContext.Provider>
    </div>
  );
};

export default HeroAnimations;
