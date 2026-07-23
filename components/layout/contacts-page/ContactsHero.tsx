import Image from 'next/image';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX } from 'react';

import HeroAnimations from '@/app/animations/HeroAnimations';
import HeroBg from '@/app/animations/HeroBg';
import HeroDescription from '@/app/animations/HeroDescription';
import HeroKicker from '@/app/animations/HeroKicker';
import HeroTitle from '@/app/animations/HeroTitle';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import StatsStrip from '@/components/layout/services-page/StatsStrip';

/**
 * ContactsHero component — the desktop-only banner of the contacts page as in
 * the static-html mock (`ContactsPage.tsx`): the Downtown studio photo under
 * a purple→pink veil, the "Beauty Studio" kicker, the page title and the
 * locations subtitle, with the gradient counters strip attached right below.
 * On mobile the mock replaces the hero with a thin gradient strip — rendered
 * by the page itself.
 *
 * Wrapped in {@link HeroAnimations} so the header plays the same loader-reveal
 * mask overlay and page-transition/parallax animations as the home hero; the
 * background, kicker, title and subtitle register their refs through the
 * {@link HeroBg}/{@link HeroKicker}/{@link HeroTitle}/{@link HeroDescription} leaf
 * wrappers. The {@link StatsStrip} lives inside the wrapper on purpose — the
 * covering mask overlay reveals the photo hero and the counters strip together
 * as one header unit (same as the services page).
 * @param   {object}                           props            - Component properties
 * @param   {string}                           props.title      - Page title from the CMS (e.g. "Contacts")
 * @param   {string}                           [props.subtitle] - Line under the title; hidden when not provided
 * @param   {Array<[string | number, string]>} [props.stats]    - Counter pairs for the strip; hidden when not provided
 * @returns {JSX.Element}                                       Hero section with background photo, titles and counters
 */
const ContactsHero = ({
  title,
  subtitle,
  stats,
}: {
  title: string;
  subtitle?: string | undefined;
  stats?: Array<[string | number, string]> | undefined;
}): JSX.Element => {
  const [dict] = ServerProvider<IAttributeValues>('dict');

  return (
    <HeroAnimations className="relative hidden overflow-hidden md:block">
      <div className="relative flex h-64 items-center justify-center overflow-hidden md:h-80">
        <div className="absolute inset-0">
          <HeroBg className="absolute inset-0">
            <Image
              src="/images/Beauty content/Contacts/Downtown/Downtown_01.jpeg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </HeroBg>
          <div className="absolute inset-0 bg-gradient-contacts-veil" />
        </div>
        <div className="relative px-4 text-center">
          <HeroKicker className="mb-2 text-xs tracking-[0.45em] text-white/75 uppercase">
            {(dict?.services_hero_kicker?.value as string | undefined) ||
              'Beauty Studio'}
          </HeroKicker>
          <HeroTitle
            testId="contacts-hero-title"
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

export default ContactsHero;
