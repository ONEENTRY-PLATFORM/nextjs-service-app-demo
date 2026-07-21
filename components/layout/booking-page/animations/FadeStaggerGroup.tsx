'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import type { JSX, ReactNode } from 'react';
import { useRef, useState } from 'react';

/**
 * FadeStaggerGroup — fade-in / fade-out wrapper with a stagger for a grid whose
 * whole contents get replaced at once (the calendar cells on a month switch,
 * the time slots on a date switch).
 *
 * The swap is played as a real out-then-in sequence: while `groupKey` differs
 * from the rendered generation the previous children stay mounted and fade away
 * from the end of the grid, and only once that is done the new children take
 * their place and fade in from the start. Rendering the new set straight away
 * would swap the labels under a running tween and read as a flicker instead of
 * a transition.
 *
 * Children are addressed through `ref.current.children` rather than a class
 * selector: the wrapper owns them structurally (it *is* the grid), so there is
 * no markup contract to keep in sync — anything placed inside is animated.
 * @param   {object}      props             - Component properties
 * @param   {ReactNode}   props.children    - Grid items to animate
 * @param   {string}      props.groupKey    - Identity of the current set; a change replays out → in
 * @param   {string}      [props.className] - CSS classes for the grid element
 * @param   {number}      [props.stagger]   - Per-item offset in seconds
 * @param   {number}      [props.duration]  - Entrance duration of a single item in seconds
 * @returns {JSX.Element}                   Animated grid wrapper
 * @see {@link https://gsap.com/cheatsheet/ GSAP cheatsheet}
 */
const FadeStaggerGroup = ({
  children,
  groupKey,
  className,
  stagger = 0.025,
  duration = 0.5,
}: {
  children: ReactNode;
  groupKey: string;
  className?: string | undefined;
  stagger?: number | undefined;
  duration?: number | undefined;
}): JSX.Element => {
  const ref = useRef<HTMLDivElement>(null);
  /** Latest children, read after the exit tween — by then props have moved on */
  const latest = useRef<ReactNode>(children);
  // eslint-disable-next-line react-hooks/refs
  latest.current = children;
  const [shown, setShown] = useState<{ key: string; node: ReactNode }>({
    key: groupKey,
    node: children,
  });

  useGSAP(
    () => {
      const items = ref.current?.children;

      /** Nothing to animate — swap generations outright */
      if (!items || items.length === 0) {
        if (shown.key !== groupKey) {
          setShown({ key: groupKey, node: latest.current });
        }
        return;
      }

      /** Outgoing set: fade away from the end, then hand over to the new one */
      if (shown.key !== groupKey) {
        gsap.to(items, {
          autoAlpha: 0,
          duration: duration * 0.6,
          ease: 'power1.in',
          stagger: { each: stagger, from: 'end' },
          onComplete: () => {
            setShown({ key: groupKey, node: latest.current });
          },
        });
        return;
      }

      /** Incoming set */
      gsap.fromTo(
        items,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration, ease: 'power1.out', stagger },
      );
    },
    { dependencies: [groupKey, shown.key], scope: ref },
  );

  /**
   * Live children while the generation is settled, the snapshot only while the
   * outgoing set fades: freezing all the time would swallow in-place updates —
   * the picked day and the picked slot would never light up.
   */
  const content = shown.key === groupKey ? children : shown.node;

  return (
    <div className={className} ref={ref}>
      {content}
    </div>
  );
};

export default FadeStaggerGroup;
