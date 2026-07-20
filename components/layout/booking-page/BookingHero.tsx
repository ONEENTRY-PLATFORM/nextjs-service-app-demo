import Image from 'next/image';
import type { JSX } from 'react';

import HeroAnimations from '@/app/animations/HeroAnimations';
import HeroBg from '@/app/animations/HeroBg';
import HeroDescription from '@/app/animations/HeroDescription';
import HeroKicker from '@/app/animations/HeroKicker';
import HeroTitle from '@/app/animations/HeroTitle';

/**
 * BookingHero component — the banner of the booking page as in the
 * static-html mock (`BookingPage.tsx` → hero): a full-bleed photo under the
 * purple→pink brand veil, the "Online booking" kicker, the page title and a
 * short subtitle. Compact on mobile (mock `h-[154px]`), full height on
 * desktop.
 *
 * Wrapped in {@link HeroAnimations} so the header plays the same loader-reveal
 * mask overlay and page-transition/parallax animations as the home hero; the
 * background, kicker, title and subtitle register their refs through the leaf
 * wrappers. The kicker/title/subtitle lines therefore animate identically to
 * the services and contacts heroes — the page-level `BookingAnimations` fades
 * only the wizard body (`.mx-auto`) and no longer touches the hero title, so
 * the header is driven by a single timeline.
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
        <HeroBg className="absolute inset-0">
          <Image
            src="/images/Offer/banner_03.jpeg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </HeroBg>
        <div className="absolute inset-0 bg-gradient-booking-veil" />
      </div>
      <div className="relative px-4 text-center">
        <HeroKicker className="mb-2 text-xs tracking-[0.4em] text-white/80 uppercase">
          Online booking
        </HeroKicker>
        <HeroTitle
          className="font-black tracking-widest text-white uppercase drop-shadow-lg"
          style={{
            fontSize: 'clamp(2rem,5vw,3.5rem)',
            textShadow: '0 0 40px #ed21f188',
          }}
        >
          {title}
        </HeroTitle>
        {subtitle && (
          <HeroDescription className="mt-2 text-base text-white/85">
            {subtitle}
          </HeroDescription>
        )}
      </div>
    </HeroAnimations>
  );
};

export default BookingHero;
