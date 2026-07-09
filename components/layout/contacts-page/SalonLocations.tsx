'use client';

import { Clock, MapPin, Navigation, Phone } from 'lucide-react';
import type { JSX, UIEvent } from 'react';
import { useState } from 'react';

import SectionHeading from '@/components/shared/SectionHeading';

/** Normalized salon of the contacts page location cards */
export type ContactSalon = {
  /** Stable key (CMS page id or the mock's `s1`…`s3`) */
  id: string;
  name: string;
  address: string;
  /** Display phone (formatted) */
  phone: string;
  /** Value of the `tel:` link (digits only) */
  tel: string;
  /** Google Maps embed URL of the map iframe */
  mapSrc: string;
  /** External directions link of the "Directions" button */
  mapsLink: string;
  /** Card accent color (hex — used with alpha suffixes in inline styles) */
  color: string;
};

/**
 * SalonCard component — a single location card as in the static-html mock
 * (`ContactsPage.tsx` → SalonCard): top accent line, salon name, address and
 * phone, number badge, hours pill, map iframe and the CTA row ("Call us" on
 * mobile, "Directions" on desktop). The mock's "View studio" button is
 * omitted until the salon detail page is ported.
 * @param   {object}       props       - Component properties
 * @param   {ContactSalon} props.salon - Salon to render
 * @param   {number}       props.idx   - Card index (number badge, animation order)
 * @returns {JSX.Element}              Location card
 */
const SalonCard = ({
  salon,
  idx,
}: {
  salon: ContactSalon;
  idx: number;
}): JSX.Element => {
  /** Hover state drives the accent-colored shadow/border (dynamic color) */
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col overflow-hidden rounded-3xl bg-white md:max-xl:w-80 md:max-xl:shrink-0 md:max-xl:snap-start"
      style={{
        boxShadow: hovered
          ? `0 16px 48px ${salon.color}28, 0 4px 16px rgba(0,0,0,0.08)`
          : '0 4px 20px rgba(0,0,0,0.07)',
        border: `1.5px solid ${hovered ? `${salon.color}50` : '#e8e8f0'}`,
        transition: 'box-shadow 0.3s, border-color 0.3s',
      }}
    >
      {/* Top accent line */}
      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, ${salon.color}, ${salon.color}44)`,
        }}
      />

      {/* Info block */}
      <div className="px-6 pt-5 pb-4">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <p
              className="mb-3 text-sm font-black tracking-[0.2em] uppercase"
              style={{ color: salon.color }}
            >
              {salon.name}
            </p>
            <div className="mb-1.5 flex min-h-11 items-baseline gap-1.5 md:max-xl:min-h-18">
              <MapPin
                size={18}
                color={salon.color}
                className="shrink-0 self-baseline"
              />
              <span className="text-base leading-snug text-slate-400">
                {salon.address}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone size={18} color={salon.color} />
              <a
                href={`tel:${salon.tel}`}
                className="text-base font-semibold text-slate-400 transition-opacity hover:opacity-70"
              >
                {salon.phone}
              </a>
            </div>
          </div>
          {/* Number badge */}
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-xl text-base font-black text-white"
            style={{
              background: `linear-gradient(135deg, ${salon.color}, ${salon.color}bb)`,
            }}
          >
            {idx + 1}
          </div>
        </div>

        {/* Hours pill */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex w-fit items-center gap-1.5 rounded-xl px-3 py-1.5"
            style={{ background: `${salon.color}10` }}
          >
            <Clock size={15} color={salon.color} />
            <span
              className="text-sm font-medium"
              style={{ color: salon.color }}
            >
              Daily 10:00–22:00
            </span>
          </div>
        </div>
      </div>

      {/* Map — fixed height so the map area is identical across all cards */}
      <div className="relative mx-4 h-48 overflow-hidden rounded-2xl">
        <iframe
          title={salon.name}
          src={salon.mapSrc}
          className="absolute inset-0 size-full border-0"
          style={{ filter: 'saturate(0.9) contrast(0.95)' }}
          loading="lazy"
        />
        {/* Map overlay fade edges */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{ boxShadow: 'inset 0 0 16px rgba(255,255,255,0.4)' }}
        />
      </div>

      {/* CTA row — "Call us" on mobile, "Directions" on tablet/desktop */}
      <div className="flex gap-2 p-4">
        <a
          href={`tel:${salon.tel}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-3.5 text-sm font-bold tracking-wide text-white uppercase transition-transform duration-200 hover:scale-[1.03] active:scale-95 md:hidden"
          style={{
            background: `linear-gradient(135deg, ${salon.color}, ${salon.color}cc)`,
            boxShadow: `0 6px 16px ${salon.color}44`,
          }}
        >
          <Phone size={18} /> Call us
        </a>
        <a
          href={salon.mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden flex-1 items-center justify-center gap-1.5 rounded-xl py-3.5 text-sm font-bold tracking-wide text-white uppercase transition-transform duration-200 hover:scale-[1.03] active:scale-95 md:flex"
          style={{
            background: `linear-gradient(135deg, ${salon.color}, ${salon.color}cc)`,
            boxShadow: `0 6px 16px ${salon.color}44`,
          }}
        >
          <Navigation size={18} /> Directions
        </a>
      </div>
    </div>
  );
};

/**
 * SalonLocations component — the "Our Locations" section of the contacts page
 * as in the static-html mock (`ContactsPage.tsx`): section heading, location
 * cards (stacked on mobile, a horizontal snap row on tablet, a 3-column grid
 * on desktop) and the scroll dots shown only where the row scrolls.
 * @param   {object}         props        - Component properties
 * @param   {ContactSalon[]} props.salons - Salons to render
 * @returns {JSX.Element}                 Locations section
 */
const SalonLocations = ({
  salons,
}: {
  salons: ContactSalon[];
}): JSX.Element => {
  /** Index of the card closest to the scroll position — drives the dots */
  const [activeLoc, setActiveLoc] = useState(0);

  const onLocScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const kids = el.children;
    let closest = 0;
    let min = Infinity;
    for (let i = 0; i < kids.length; i++) {
      const kid = kids[i];
      if (!(kid instanceof HTMLElement)) continue;
      const d = Math.abs(kid.offsetLeft - el.scrollLeft);
      if (d < min) {
        min = d;
        closest = i;
      }
    }
    setActiveLoc(closest);
  };

  return (
    <section
      className="pt-6 pb-2 md:pt-10 md:pb-6"
      style={{ background: 'linear-gradient(180deg,#f7f7fb 0%,#fff 60%)' }}
    >
      <div className="mx-auto max-w-7xl px-3 md:px-8">
        <div className="mb-6 text-center md:mb-10">
          <SectionHeading size="lg">Our Locations</SectionHeading>
        </div>

        {salons.length === 0 ? (
          <p className="py-8 text-center text-base text-neutral-300">
            No salon locations available at the moment.
          </p>
        ) : (
          <>
            <div
              onScroll={onLocScroll}
              className="grid grid-cols-1 gap-6 xl:grid-cols-3 md:max-xl:-mx-8 md:max-xl:flex md:max-xl:snap-x md:max-xl:overflow-x-auto md:max-xl:px-8 md:max-xl:[&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none' }}
            >
              {salons.map((salon, i) => (
                <SalonCard key={salon.id} salon={salon} idx={i} />
              ))}
            </div>

            {/* Scroll dots — tablet only (where the cards scroll horizontally) */}
            <div className="mt-5 hidden items-center justify-center gap-1.5 md:max-xl:flex">
              {salons.map((salon, i) => (
                <span
                  key={salon.id}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: activeLoc === i ? 18 : 6,
                    height: 6,
                    background: activeLoc === i ? salon.color : '#d4d5e1',
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default SalonLocations;
