'use client';

import { ChevronDown, Phone } from 'lucide-react';
import type { JSX } from 'react';
import { useState } from 'react';

/**
 * Footer salon cell, as in the static-html mock. On mobile the salon name is
 * a button that expands/collapses the address and phone; on `sm+` the details
 * are always visible and columns are separated by vertical dividers.
 * @param   {object}      props                - Component properties
 * @param   {string}      props.title          - Salon name
 * @param   {string}      props.address        - Salon address
 * @param   {string}      props.phone          - Raw phone for the tel: link
 * @param   {string}      props.phoneFormatted - Phone as displayed
 * @param   {number}      props.index          - Cell index (dividers start from the second cell)
 * @returns {JSX.Element}                      Salon contact cell
 */
const SalonCell = ({
  title,
  address,
  phone,
  phoneFormatted,
  index,
}: {
  title: string;
  address: string;
  phone: string;
  phoneFormatted: string;
  index: number;
}): JSX.Element => {
  /** Mobile only: expand/collapse the salon details */
  const [open, setOpen] = useState(false);

  return (
    <div
      className={
        'min-w-0 pb-4 sm:pb-0' +
        (index > 0
          ? ' border-t border-black/80 pt-4 sm:border-t-0 sm:border-l sm:border-black/80 sm:pt-0 sm:pl-4'
          : '')
      }
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="mb-0 flex w-full items-center justify-between gap-2 text-left sm:mb-3 sm:cursor-default"
      >
        <span className="text-sm font-bold tracking-wide uppercase sm:text-base">
          {title}
        </span>
        <ChevronDown
          size={16}
          className="shrink-0 transition-transform duration-200 sm:hidden"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>
      <div className={`${open ? 'block' : 'hidden'} mt-3 sm:mt-0 sm:block`}>
        <address className="not-italic">
          {address && (
            <p className="mb-2 text-sm opacity-90 xl:min-h-0 sm:min-h-10">
              {address}
            </p>
          )}
          {phone && (
            <a
              href={'tel:' + phone}
              className="flex items-center gap-1.5 text-sm focus:outline-none"
            >
              <Phone size={16} className="inline shrink-0" />
              <span className="whitespace-nowrap">
                {phoneFormatted || phone}
              </span>
            </a>
          )}
        </address>
      </div>
    </div>
  );
};

export default SalonCell;
