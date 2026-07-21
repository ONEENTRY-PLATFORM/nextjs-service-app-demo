'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { usePathname } from 'next/navigation';
import type { FocusEvent, JSX, PointerEvent, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

/** Thickness of the bar in pixels — matches the `border-b-2` it replaced */
const BAR_HEIGHT = 2;
/** Travel time of the edge that leads the movement, in seconds */
const LEAD_DURATION = 0.34;
/** Travel time of the trailing edge — the lag between the two is what stretches the bar */
const TRAIL_DURATION = 0.52;

/**
 * NavUnderline — the desktop main menu list with a single underline that flows
 * from item to item.
 *
 * Instead of every link drawing its own bottom border, one bar lives next to the
 * list and is moved to whatever item the pointer (or keyboard focus) is on; when
 * the menu is left it slides back to the item of the current page, and hides
 * altogether when the page is not in the menu.
 *
 * The travel is not a plain slide: the leading edge of the bar arrives faster
 * than the trailing one, so the line stretches while it flies and settles into
 * the width of the target item. Both edges are tweened on one proxy object and
 * written to the bar as `x`/`width`, which keeps the whole move on the compositor.
 *
 * Items are addressed through `ref.current.children` — the wrapper *is* the list,
 * so its children are its own markup, not a class-name contract. `hrefs` must be
 * in the same order as `children`: it is the only thing that tells the bar which
 * item belongs to the current route.
 * @param   {object}      props             - Component properties
 * @param   {ReactNode}   props.children    - Menu items, one `li` per href
 * @param   {string[]}    props.hrefs       - Item hrefs in render order, used to find the active one
 * @param   {string}      [props.className] - CSS classes for the list element
 * @returns {JSX.Element}                   Menu list with the animated underline
 * @see {@link https://gsap.com/cheatsheet/ GSAP cheatsheet}
 */
const NavUnderline = ({
  children,
  hrefs,
  className,
}: {
  children: ReactNode;
  hrefs: string[];
  className?: string | undefined;
}): JSX.Element => {
  const pathname = usePathname();
  const boxRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  /** Tweened bar geometry in container coordinates */
  const edges = useRef({ left: 0, right: 0, top: 0 });
  /** Item the bar currently sits on; `null` while the bar is hidden */
  const placed = useRef<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [measureToken, setMeasureToken] = useState(0);

  const activeIndex = hrefs.indexOf(pathname);
  /** Hover wins over the current page, the current page wins over nothing */
  const target = hovered ?? (activeIndex < 0 ? null : activeIndex);

  /**
   * Index of the menu item that owns an event target.
   * @param   {EventTarget | null} node - Element the event came from
   * @returns {number | null}           Item index, or `null` outside the items
   */
  const indexOfItem = (node: EventTarget | null): number | null => {
    const items = listRef.current?.children;
    if (!items || !(node instanceof Node)) {
      return null;
    }
    const index = Array.from(items).findIndex((item) => item.contains(node));
    return index < 0 ? null : index;
  };

  /**
   * Pointer over an item (or over its dropdown) pulls the bar to that item.
   * Gaps between the items are ignored so the bar does not flick back mid-way.
   * @param {PointerEvent<HTMLUListElement>} event - Pointer event
   */
  const handlePointerOver = (event: PointerEvent<HTMLUListElement>): void => {
    const index = indexOfItem(event.target);
    if (index !== null) {
      setHovered(index);
    }
  };

  /**
   * Keyboard focus moves the bar as well, so tabbing reads like hovering.
   * @param {FocusEvent<HTMLUListElement>} event - Focus event
   */
  const handleFocus = (event: FocusEvent<HTMLUListElement>): void => {
    const index = indexOfItem(event.target);
    if (index !== null) {
      setHovered(index);
    }
  };

  /** Leaving the menu hands the bar back to the current page */
  const handleRelease = (): void => {
    setHovered(null);
  };

  /** Re-measure when the header changes width or the nav becomes visible */
  useEffect(() => {
    const box = boxRef.current;
    if (!box) {
      return;
    }
    const observer = new ResizeObserver(() =>
      setMeasureToken((token) => token + 1),
    );
    observer.observe(box);

    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      const bar = barRef.current;
      const box = boxRef.current;
      const items = listRef.current?.children;
      const item = target === null ? undefined : items?.[target];
      if (!bar || !box) {
        return;
      }

      /** Nothing to point at — fade out and forget where the bar was */
      if (!item) {
        placed.current = null;
        gsap.to(bar, { autoAlpha: 0, duration: 0.25, ease: 'power1.out' });
        return;
      }

      const itemBox = item.getBoundingClientRect();
      const hostBox = box.getBoundingClientRect();
      const left = itemBox.left - hostBox.left;
      const right = itemBox.right - hostBox.left;
      const top = itemBox.bottom - hostBox.top - BAR_HEIGHT;
      const edge = edges.current;

      /** First appearance, or a return from hiding — show it in place */
      if (placed.current === null) {
        placed.current = target;
        edges.current = { left, right, top };
        gsap.set(bar, { x: left, y: top, width: right - left });
        gsap.to(bar, { autoAlpha: 1, duration: 0.3, ease: 'power1.out' });
        return;
      }

      /** Same item, new geometry (resize, late font) — follow it without a tween */
      if (placed.current === target) {
        edges.current = { left, right, top };
        gsap.set(bar, { x: left, y: top, width: right - left, autoAlpha: 1 });
        return;
      }

      /**
       * Write the tweened edges onto the bar. Both tweens share it, so the bar
       * is stretched by whichever edge is currently behind.
       */
      const applyEdges = (): void => {
        gsap.set(bar, {
          x: edge.left,
          y: edge.top,
          width: Math.max(edge.right - edge.left, 0),
        });
      };

      const forward = left > edge.left;
      placed.current = target;

      gsap.to(edge, {
        left,
        top,
        duration: forward ? TRAIL_DURATION : LEAD_DURATION,
        ease: 'power3.out',
        overwrite: 'auto',
        onUpdate: applyEdges,
      });
      gsap.to(edge, {
        right,
        duration: forward ? LEAD_DURATION : TRAIL_DURATION,
        ease: 'power3.out',
        overwrite: 'auto',
        onUpdate: applyEdges,
      });
      gsap.to(bar, { autoAlpha: 1, duration: 0.2 });
    },
    { dependencies: [target, measureToken], scope: boxRef },
  );

  return (
    <div
      ref={boxRef}
      className="relative my-auto"
      onPointerLeave={handleRelease}
    >
      <ul
        ref={listRef}
        className={className}
        onPointerOver={handlePointerOver}
        onFocus={handleFocus}
        onBlur={handleRelease}
      >
        {children}
      </ul>
      <span
        ref={barRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute top-0 left-0 h-0.5 rounded-full bg-fuchsia-500 opacity-0"
      />
    </div>
  );
};

export default NavUnderline;
