'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import type { JSX } from 'react';
import { useState } from 'react';

/** A footer menu item; items with children render as an accordion category. */
export type FooterMenuItem = {
  title: string;
  href: string;
  children?: FooterMenuItem[];
};

/**
 * Footer menu list: items with children are accordion categories revealing their
 * sub-items; plain items are links. With `dividers` every row gets a bottom
 * border (desktop footer variant), otherwise rows are spaced (mobile
 * collapse variant).
 * @param   {object}           props            - Component properties
 * @param   {FooterMenuItem[]} props.items      - Menu items to render
 * @param   {boolean}          [props.dividers] - Render rows with divider borders (desktop variant)
 * @returns {JSX.Element}                       Footer menu list
 */
const FooterServicesMenu = ({
  items,
  dividers = false,
}: {
  items: FooterMenuItem[];
  dividers?: boolean;
}): JSX.Element => {
  const [openHref, setOpenHref] = useState<string | null>(null);

  return (
    <ul className={dividers ? '' : 'space-y-3'}>
      {items.map((item) => {
        const hasChildren = Boolean(item.children?.length);
        const open = openHref === item.href;

        if (!hasChildren) {
          return (
            <li
              key={item.href}
              className={dividers ? 'border-b border-black/80' : ''}
            >
              <Link
                prefetch={false}
                href={item.href}
                className={`flex w-full text-left text-base transition-opacity hover:opacity-70 ${dividers ? 'py-3' : ''}`}
              >
                {item.title}
              </Link>
            </li>
          );
        }

        return (
          <li
            key={item.href}
            className={dividers ? 'border-b border-black/80' : ''}
          >
            <button
              onClick={() => setOpenHref(open ? null : item.href)}
              className={`flex w-full items-center justify-between gap-2 text-left text-base font-semibold ${dividers ? 'py-3' : ''}`}
            >
              <span>{item.title}</span>
              <ChevronDown
                size={14}
                className="shrink-0 transition-transform duration-200"
                style={{ transform: open ? 'rotate(180deg)' : 'none' }}
              />
            </button>
            <ul
              className={`${open ? 'block' : 'hidden'} space-y-2 pl-3 ${dividers ? 'pb-3' : 'mt-2'}`}
            >
              {item.children?.map((sub) => (
                <li key={sub.href}>
                  <Link
                    prefetch={false}
                    href={sub.href}
                    className="text-base opacity-90 transition-opacity hover:opacity-70"
                  >
                    {sub.title}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
};

export default FooterServicesMenu;
