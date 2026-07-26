import Image from 'next/image';
import type { JSX } from 'react';

import HeroAnimations from '@/app/animations/HeroAnimations';
import HeroBg from '@/app/animations/HeroBg';
import HeroDescription from '@/app/animations/HeroDescription';
import HeroKicker from '@/app/animations/HeroKicker';
import HeroTitle from '@/app/animations/HeroTitle';

import StatsStrip from './StatsStrip';

/**
 * ServicesHero component — the banner section of the services page as in the
 * static-html mock (`PricesPage.tsx`): a full-bleed photo under a brand
 * cyan→pink veil, the kicker (page `page_tag` attribute, fallback "Beauty
 * Studio"), the page title and a short stats subtitle, with the gradient
 * counters strip attached right below.
 *
 * Wrapped in {@link HeroAnimations} so the header plays the same loader-reveal
 * mask overlay and page-transition/parallax animations as the home hero; the
 * background, kicker, title and subtitle register their refs through the
 * {@link HeroBg}/{@link HeroKicker}/{@link HeroTitle}/{@link HeroDescription} leaf
 * wrappers. The {@link StatsStrip} lives inside the wrapper on purpose — the
 * covering mask overlay reveals the photo hero and the counters strip together
 * as one header unit.
 * @param   {object}                           props            - Component properties
 * @param   {string}                           props.title      - Page title from the CMS (e.g. "Services & prices")
 * @param   {string}                           [props.kicker]   - Kicker line above the title (page `page_tag` attribute)
 * @param   {string}                           [props.subtitle] - Stats line under the title; hidden when not provided
 * @param   {Array<[string | number, string]>} [props.stats]    - Counter pairs for the strip; hidden when not provided
 * @param   {string}                           [props.bg]       - Background photo URL (page `page_hero_bg` attribute)
 * @returns {JSX.Element}                                       Hero section with background photo, titles and counters
 */
const ServicesHero = ({
  title,
  kicker,
  subtitle,
  stats,
  bg,
}: {
  title: string;
  kicker?: string | undefined;
  subtitle?: string | undefined;
  stats?: Array<[string | number, string]> | undefined;
  bg?: string | undefined;
}): JSX.Element => {
  return (
    <HeroAnimations className="relative overflow-hidden">
      <div className="relative flex h-64 items-center justify-center overflow-hidden md:h-80">
        <div className="absolute inset-0">
          <HeroBg className="absolute inset-0">
            <Image
              src={bg || '/images/Offer/banner_main.jpeg'}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </HeroBg>
          <div className="absolute inset-0 bg-gradient-hero-veil" />
        </div>
        <div className="relative px-4 text-center">
          <HeroKicker className="mb-2 text-xs tracking-[0.45em] text-white/75 uppercase">
            {kicker || 'Beauty Studio'}
          </HeroKicker>
          <HeroTitle
            className="font-black tracking-widest text-white uppercase"
            style={{
              fontSize: 'clamp(2rem,5vw,3.5rem)',
              textShadow: '0 0 40px #ed21f188',
            }}
          >
            {title}
          </HeroTitle>
          {subtitle && (
            <HeroDescription className="mt-2 text-sm text-white/70">
              {subtitle}
            </HeroDescription>
          )}
        </div>
      </div>
      {stats && stats.length > 0 && <StatsStrip stats={stats} />}
    </HeroAnimations>
  );
};

export default ServicesHero;
