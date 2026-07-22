'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import type { FocusEvent, JSX, PointerEvent, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

/** Thickness of the bar in pixels — matches the `border-b-2` it replaces */
const BAR_HEIGHT = 2;
/** Travel time of the edge that leads the movement, in seconds */
const LEAD_DURATION = 0.34;
/** Travel time of the trailing edge — the lag between the two is what stretches the bar */
const TRAIL_DURATION = 0.52;

/**
 * UnderlineFlow — a list of links or buttons with a single underline that flows
 * from item to item.
 *
 * Instead of every item drawing its own bottom border, one bar lives next to the
 * list and is moved to whatever item the pointer (or keyboard focus) is on; when
 * the list is left it slides back to the item `active` points at, and hides
 * altogether while `active` is `null`.
 *
 * The travel is not a plain slide: the leading edge of the bar arrives faster
 * than the trailing one, so the line stretches while it flies and settles into
 * the width of the target item. Both edges are tweened on one proxy object and
 * written to the bar as `x`/`width`, which keeps the whole move on the compositor.
 *
 * Items are addressed through `ref.current.children` — the wrapper *is* the list,
 * so its children are its own markup, not a class-name contract. Anything that
 * must not be underlined (separators, dots) belongs inside an item or in a
 * pseudo-element, not next to the items.
 * @param   {object}        props             - Component properties
 * @param   {ReactNode}     props.children    - List items, one element per entry
 * @param   {number | null} props.active      - Index of the item the bar rests on, `null` to hide it
 * @param   {string}        [props.className] - CSS classes for the list element
 * @param   {'ul' | 'div'}  [props.element]   - Tag of the list element, `div` by default
 * @returns {JSX.Element}                     List with the animated underline
 * @see {@link https://gsap.com/cheatsheet/ GSAP cheatsheet}
 */
const UnderlineFlow = ({
  children,
  active,
  className,
  element = 'div',
}: {
  children: ReactNode;
  active: number | null;
  className?: string | undefined;
  element?: 'ul' | 'div' | undefined;
}): JSX.Element => {
  const boxRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLElement | null>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  /** Tweened bar geometry in container coordinates */
  const edges = useRef({ left: 0, right: 0, top: 0 });
  /** Item the bar currently sits on; `null` while the bar is hidden */
  const placed = useRef<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [measureToken, setMeasureToken] = useState(0);
  /** The items themselves were replaced — the bar has to travel, not jump */
  const contentDirty = useRef(false);

  /** Hover wins over the active item, the active item wins over nothing */
  const target = hovered ?? active;

  /**
   * Keep the list node, whichever tag it was rendered with.
   * @param {HTMLElement | null} node - List element, `null` on unmount
   */
  const keepList = (node: HTMLElement | null): void => {
    listRef.current = node;
  };

  /**
   * Index of the list item that owns an event target.
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
   * Pointer over an item (or over anything it owns) pulls the bar to that item.
   * Gaps between the items are ignored so the bar does not flick back mid-way.
   * @param {PointerEvent<HTMLElement>} event - Pointer event
   */
  const handlePointerOver = (event: PointerEvent<HTMLElement>): void => {
    const index = indexOfItem(event.target);
    if (index !== null) {
      setHovered(index);
    }
  };

  /**
   * Keyboard focus moves the bar as well, so tabbing reads like hovering.
   * @param {FocusEvent<HTMLElement>} event - Focus event
   */
  const handleFocus = (event: FocusEvent<HTMLElement>): void => {
    const index = indexOfItem(event.target);
    if (index !== null) {
      setHovered(index);
    }
  };

  /** Leaving the list hands the bar back to the active item */
  const handleRelease = (): void => {
    setHovered(null);
  };

  /** Re-measure when the list changes width or becomes visible */
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

  /**
   * Re-measure when the items are swapped for a different set — a tab row that
   * switches to another category keeps its own width, so the resize observer
   * above never hears about it while every item underneath has moved.
   */
  useEffect(() => {
    const list = listRef.current;
    if (!list) {
      return;
    }
    const observer = new MutationObserver(() => {
      contentDirty.current = true;
      setMeasureToken((token) => token + 1);
    });
    observer.observe(list, {
      childList: true,
      subtree: true,
      characterData: true,
    });

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
      /** A swapped item set moves the bar; a plain re-measure only re-seats it */
      const swapped = contentDirty.current;
      contentDirty.current = false;

      /**
       * Drop the bar onto the target without travelling. Any tween in flight is
       * killed first: it owns the same edge object and would keep writing its
       * own values over the ones just seated.
       * @param {boolean} fade - Fade the bar in instead of showing it outright
       */
      const seatBar = (fade: boolean): void => {
        gsap.killTweensOf(edge);
        edge.left = left;
        edge.right = right;
        edge.top = top;
        gsap.set(bar, { x: left, y: top, width: right - left });
        if (fade) {
          gsap.to(bar, { autoAlpha: 1, duration: 0.3, ease: 'power1.out' });
        } else {
          gsap.set(bar, { autoAlpha: 1 });
        }
      };

      /** First appearance, or a return from hiding — show it in place */
      if (placed.current === null) {
        placed.current = target;
        seatBar(true);
        return;
      }

      /** Already there — a re-render that moved nothing */
      if (
        placed.current === target &&
        Math.abs(edge.left - left) < 0.5 &&
        Math.abs(edge.right - right) < 0.5 &&
        Math.abs(edge.top - top) < 0.5
      ) {
        gsap.set(bar, { autoAlpha: 1 });
        return;
      }

      /** Same item, new geometry (resize, late font) — follow it without a tween */
      if (placed.current === target && !swapped) {
        seatBar(false);
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

  const listProps = {
    ref: keepList,
    className,
    onPointerOver: handlePointerOver,
    onFocus: handleFocus,
    onBlur: handleRelease,
    children,
  };

  return (
    <div
      ref={boxRef}
      className="relative my-auto"
      onPointerLeave={handleRelease}
    >
      {element === 'ul' ? <ul {...listProps} /> : <div {...listProps} />}
      <span
        ref={barRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute top-0 left-0 h-0.5 rounded-full bg-fuchsia-500 opacity-0"
      />
    </div>
  );
};

export default UnderlineFlow;
