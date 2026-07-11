/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import type { JSX } from 'react';

/**
 * HomeCtaBanner — the "Get 10% off for booking online" banner between the
 * BEST OFFERS and OUR SPECIALISTS sections, ported from the static-html mock
 * (`HomePage.tsx` → BOOKING CTA BANNER). The banner artwork carries its own
 * text, so the section renders the promo image (a portrait crop on mobile, the
 * wide banner on desktop) with a glassmorphic "Book Now" button overlaid — the
 * button leads to the booking page.
 * @returns {JSX.Element} Booking CTA banner section
 */
const HomeCtaBanner = (): JSX.Element => {
  return (
    <section className="bg-white py-4 xl:py-10 md:py-6">
      <div className="mx-auto w-full max-w-350 px-5">
        <div className="relative w-full overflow-hidden rounded-3xl">
          {/* Mobile banner */}
          <img
            src="/images/baners/Mobile/Off_10_mobile.png"
            alt="Get 10% off for booking online"
            className="h-auto w-full object-cover md:hidden"
          />
          {/* Desktop banner */}
          <img
            src="/images/baners/Off_10.png"
            alt="Get 10% off for booking online"
            className="hidden h-auto w-full object-cover md:block"
          />
          {/* Booking button — glassmorphic, centered on mobile, bottom-right on desktop */}
          <div className="absolute inset-0 flex items-end justify-center pr-0 pb-[15%] md:justify-end md:pr-[5%] md:pb-[5%]">
            <Link
              href="/booking"
              className="relative shrink-0 rounded-xl px-8 py-3.5 text-base font-black tracking-wider text-white uppercase transition-transform duration-200 hover:scale-105 active:scale-95"
              style={{
                background: 'rgba(255,255,255,0.22)',
                border: '2px solid rgba(255,255,255,0.5)',
                backdropFilter: 'blur(8px)',
              }}
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeCtaBanner;
