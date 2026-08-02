'use client';

import type { JSX, ReactNode } from 'react';
import { useRef } from 'react';

import { useNearViewport } from '@/components/hooks/useNearViewport';

/**
 * NearViewport component — a layout box that mounts its children only once it
 * approaches the viewport.
 *
 * The wrapper `div` carries the gated content's positioning classes, so the
 * layout never shifts: the box is always there, the content (typically an
 * `<Image>`) mounts when {@link useNearViewport} fires. Being a client
 * component, it also gates content rendered by server components (the home
 * strips) without converting them to clients — the children arrive as a
 * pre-rendered payload and enter the DOM only near the viewport.
 *
 * Use on repeating listing cards; never on heroes / above-the-fold content or
 * inside lazily-mounted modals (per the performance rule).
 * @param   {object}      props              - Component properties
 * @param   {string}      [props.className]  - Classes of the always-present layout box
 * @param   {string}      [props.rootMargin] - How far ahead of the viewport to trigger (default `'300px'`)
 * @param   {ReactNode}   props.children     - Content mounted once the box is near the viewport
 * @returns {JSX.Element}                    The layout box with lazily-mounted content
 */
const NearViewport = ({
  className,
  rootMargin = '300px',
  children,
}: {
  className?: string | undefined;
  rootMargin?: string | undefined;
  children: ReactNode;
}): JSX.Element => {
  const boxRef = useRef<HTMLDivElement>(null);
  const isNear = useNearViewport(boxRef, { rootMargin });
  return (
    <div ref={boxRef} className={className}>
      {isNear ? children : null}
    </div>
  );
};

export default NearViewport;
