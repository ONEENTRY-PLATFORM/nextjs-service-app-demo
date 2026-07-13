import Image from 'next/image';
import type { JSX } from 'react';

import HeroAnimations from '@/app/animations/HeroAnimations';

/**
 * BookingHero component — the banner of the booking page as in the
 * static-html mock (`BookingPage.tsx` → hero): a full-bleed photo under the
 * purple→pink brand veil, the "Online booking" kicker, the page title and a
 * short subtitle. Compact on mobile (mock `h-[154px]`), full height on
 * desktop.
 *
 * Wrapped in {@link HeroAnimations} so the header plays the same loader-reveal
 * mask overlay and page-transition/parallax animations as the home hero; the
 * `hero-bg` / `hero-title` / `hero-description` hook classes are what that
 * wrapper animates. The title keeps its `title` class as well — the page-level
 * `BookingAnimations` still targets `.title` / `.mx-auto` for its own fade, and
 * both animations drive the title to the same state (visible on enter, hidden
 * on leave).
 * @param   {object}      props            - Component properties
 * @param   {string}      props.title      - Page title from the CMS (e.g. "Book Online")
 * @param   {string}      [props.subtitle] - Line under the title; hidden when not provided
 * @returns {JSX.Element}                  Hero section with background photo and titles
 */
const BookingHero = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string | undefined;
}): JSX.Element => {
  return (
    <HeroAnimations className="relative flex h-38.5 items-center justify-center overflow-hidden md:h-80">
      <div className="absolute inset-0">
        <Image
          src="/images/Offer/banner_03.jpeg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="hero-bg object-cover"
        />
        <div className="absolute inset-0 bg-gradient-booking-veil" />
      </div>
      <div className="relative px-4 text-center">
        <p className="mb-2 text-xs tracking-[0.4em] text-white/80 uppercase">
          Online booking
        </p>
        <h1
          className="title hero-title font-black tracking-widest text-white uppercase drop-shadow-lg"
          style={{
            fontSize: 'clamp(2rem,5vw,3.5rem)',
            textShadow: '0 0 40px #ed21f188',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="hero-description mt-2 text-base text-white/85">
            {subtitle}
          </p>
        )}
      </div>
    </HeroAnimations>
  );
};

export default BookingHero;
