'use client';

import { ChevronDown } from 'lucide-react';
import type { JSX, ReactNode } from 'react';
import { useState } from 'react';

/**
 * Mobile footer collapse: an uppercase bold
 * title with a chevron that expands the content below.
 * @param   {object}      props          - Component properties
 * @param   {string}      props.title    - Collapse header text
 * @param   {ReactNode}   props.children - Content revealed when expanded
 * @returns {JSX.Element}                Collapsible footer section
 */
const FooterCollapse = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): JSX.Element => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="text-sm font-bold tracking-wide uppercase">
          {title}
        </span>
        <ChevronDown
          size={16}
          className="shrink-0 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>
      <div className={`${open ? 'block' : 'hidden'} mt-3`}>{children}</div>
    </div>
  );
};

export default FooterCollapse;
