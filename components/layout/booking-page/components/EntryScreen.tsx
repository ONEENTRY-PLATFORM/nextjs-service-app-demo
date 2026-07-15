'use client';

import { ChevronRight, MapPin, User } from 'lucide-react';
import type { JSX } from 'react';
import { useState } from 'react';

import { BRAND_GRADIENT, CYAN, DARK, MUTED, PINK } from '../constants';
import type { BookingFlow } from '../types';

/** Entry options — the two booking flows (mock `EntryScreen` → `options`) */
const OPTIONS: {
  flow: BookingFlow;
  title: string;
  subtitle: string;
  Icon: typeof MapPin;
  gradient: string;
}[] = [
  {
    flow: 'salon-first',
    title: 'Browse the studio',
    subtitle: 'Pick a location, choose your service, then a specialist',
    Icon: MapPin,
    gradient: `linear-gradient(135deg,${CYAN}, #26D2E6)`,
  },
  {
    flow: 'specialist-first',
    title: 'Choose a specialist',
    subtitle:
      'Browse our specialists by category — the studio and time come with them',
    Icon: User,
    gradient: BRAND_GRADIENT,
  },
];

/**
 * EntryScreen — the first screen of the booking wizard, ported from the
 * static-html mock (`BookingPage.tsx` → `EntryScreen`): on desktop two cards
 * ("Browse the studio" / "Choose a specialist"), on mobile a segmented
 * Studio / Specialist toggle with a single Continue button.
 * @param   {object}                      props          - Component properties
 * @param   {(flow: BookingFlow) => void} props.onChoose - Start the picked flow
 * @returns {JSX.Element}                                Entry screen
 */
const EntryScreen = ({
  onChoose,
}: {
  onChoose: (flow: BookingFlow) => void;
}): JSX.Element => {
  const [pick, setPick] = useState<BookingFlow>('salon-first');
  const picked = OPTIONS.find((o) => o.flow === pick) ?? OPTIONS[0];

  return (
    <div className="space-y-5" data-testid="booking-entry">
      <div>
        <p
          className="mb-2 text-xs tracking-widest uppercase"
          style={{ color: PINK }}
        >
          Start your booking
        </p>
        <h3 className="text-xl font-light" style={{ color: DARK }}>
          How would you like to start?
        </h3>
        <p className="mt-1 hidden text-sm sm:block" style={{ color: MUTED }}>
          Both paths take you to the same booking — pick whichever feels
          natural.
        </p>
      </div>

      {/* Mobile: segmented Studio / Specialist toggle */}
      <div className="space-y-4 sm:hidden">
        <div className="flex rounded-2xl p-1" style={{ background: '#eef0f4' }}>
          {OPTIONS.map((o) => {
            const active = pick === o.flow;
            return (
              <button
                key={o.flow}
                onClick={() => setPick(o.flow)}
                className="flex-1 rounded-xl py-3 text-sm font-bold tracking-wide uppercase transition-all"
                style={
                  active
                    ? {
                        background: '#fff',
                        color: PINK,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      }
                    : { background: 'transparent', color: MUTED }
                }
              >
                {o.flow === 'salon-first' ? 'Studio' : 'Specialist'}
              </button>
            );
          })}
        </div>
        <p className="text-base leading-normal" style={{ color: MUTED }}>
          {picked?.subtitle}
        </p>
        <button
          onClick={() => onChoose(pick)}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-bold tracking-wider text-white uppercase transition-transform active:scale-95"
          style={{
            background: BRAND_GRADIENT,
            boxShadow: `0 6px 20px ${PINK}44`,
          }}
        >
          Continue <ChevronRight size={16} />
        </button>
      </div>

      {/* Desktop / tablet: the two cards */}
      <div className="hidden items-stretch gap-4 sm:grid sm:grid-cols-2">
        {OPTIONS.map(({ flow, title, subtitle, Icon, gradient }) => (
          <button
            key={flow}
            data-testid={`booking-flow-${flow}`}
            onClick={() => onChoose(flow)}
            className="group relative flex h-full overflow-hidden rounded-2xl text-left transition-transform duration-200 hover:-translate-y-1 active:scale-95"
            style={{
              background: '#fff',
              border: '1.5px solid #e8e8f0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            }}
          >
            <div className="flex w-full flex-col p-6">
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-2xl"
                style={{
                  background: gradient,
                  boxShadow: `0 8px 20px ${PINK}22`,
                }}
              >
                <Icon size={22} color="#fff" />
              </div>

              <p className="mt-5 text-base font-light" style={{ color: DARK }}>
                {title}
              </p>

              {/* Description — grows to absorb height differences */}
              <p
                className="mt-2 flex-1 text-base leading-normal"
                style={{ color: MUTED }}
              >
                {subtitle}
              </p>

              {/* CTA — pinned to bottom */}
              <div
                className="mt-4 flex items-center gap-1 text-base font-bold"
                style={{ color: PINK }}
              >
                Continue <ChevronRight size={14} />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EntryScreen;
