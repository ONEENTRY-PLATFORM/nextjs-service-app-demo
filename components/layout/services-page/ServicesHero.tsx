import Image from 'next/image';
import type { JSX } from 'react';

/**
 * ServicesHero component — the banner section of the services page as in the
 * static-html mock (`PricesPage.tsx`): a full-bleed photo under a brand
 * cyan→pink veil, the "Beauty Studio" kicker, the page title and a short
 * stats subtitle.
 * @param   {object}      props            - Component properties
 * @param   {string}      props.title      - Page title from the CMS (e.g. "Services & prices")
 * @param   {string}      [props.subtitle] - Stats line under the title; hidden when not provided
 * @returns {JSX.Element}                  Hero section with background photo and titles
 */
const ServicesHero = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string | undefined;
}): JSX.Element => {
  return (
    <section className="relative flex h-64 items-center justify-center overflow-hidden md:h-80">
      <div className="absolute inset-0">
        <Image
          src="/images/Beauty content/Banner_foto/banner_main.jpeg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero-veil" />
      </div>
      <div className="relative px-4 text-center">
        <p className="mb-2 text-xs tracking-[0.45em] text-white/75 uppercase">
          Beauty Studio
        </p>
        <h1
          className="font-black tracking-widest text-white uppercase"
          style={{
            fontSize: 'clamp(2rem,5vw,3.5rem)',
            textShadow: '0 0 40px #ed21f188',
          }}
        >
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-sm text-white/70">{subtitle}</p>}
      </div>
    </section>
  );
};

export default ServicesHero;
