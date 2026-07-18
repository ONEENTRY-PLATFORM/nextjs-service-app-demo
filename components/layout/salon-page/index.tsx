'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { JSX } from 'react';
import { useState } from 'react';

import RevealAnimations from '@/app/animations/RevealAnimations';

import SalonLightbox from './components/SalonLightbox';
import SalonPhotoGallery from './components/SalonPhotoGallery';
import SalonSidebar from './components/SalonSidebar';
import type { SalonDetail } from './types';

/**
 * SalonPageContent — the salon detail page body ported from the static-html
 * mock (`SalonPage.tsx`): a 5px gradient strip, "Back to Contacts" link, the
 * salon name header, a photo gallery (hero + thumbnails on desktop, carousel on
 * mobile) with a lightbox, and an About block beside an info/map sidebar.
 * @param   {object}      props       - Component properties
 * @param   {SalonDetail} props.salon - Salon to render
 * @returns {JSX.Element}             Salon detail page content
 */
const SalonPageContent = ({ salon }: { salon: SalonDetail }): JSX.Element => {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const c = salon.color;

  return (
    <div className="bg-white" data-testid="salon-page">
      {/* Gradient strip */}
      <div className="h-1.25 bg-gradient-stats" />

      {/* Back link */}
      <div className="mx-auto max-w-7xl px-3 pt-6 md:px-8">
        <Link
          href="/contacts"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 transition-opacity hover:opacity-70"
        >
          <ArrowLeft size={16} /> Back to Contacts
        </Link>
      </div>

      {/* Title + photo gallery */}
      <section className="pt-6 pb-10">
        <div className="mx-auto max-w-7xl px-3 md:px-8">
          <RevealAnimations className="px-3 text-center lg:px-0 lg:text-left">
            <h1 className="inline-block border-b border-ink pb-1.5 text-[clamp(26px,4vw,2.6rem)] font-light tracking-fine text-ink uppercase">
              {salon.name}
            </h1>
          </RevealAnimations>
          <RevealAnimations className="mt-6">
            <SalonPhotoGallery
              photos={salon.photos}
              accent={c}
              onOpen={setLightboxIdx}
            />
          </RevealAnimations>
        </div>
      </section>

      {/* About + sidebar */}
      <section className="pb-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-3 md:px-8 lg:grid-cols-[1.6fr_1fr]">
          <RevealAnimations className="px-3 lg:px-0">
            <p
              className="mb-3 text-sm font-black tracking-[0.25em] uppercase"
              style={{ color: c }}
            >
              About this studio
            </p>
            {salon.about.map((para, i) => (
              <p
                key={i}
                className="mb-4 text-justify text-base leading-relaxed text-slate-400"
              >
                {para}
              </p>
            ))}

            {salon.highlights.length > 0 && (
              <ul className="mt-8 grid grid-cols-1 gap-y-2">
                {salon.highlights.map((h, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-base text-slate-400"
                  >
                    <span
                      aria-hidden
                      className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full"
                      style={{ background: c }}
                    />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            )}
          </RevealAnimations>

          <RevealAnimations fade>
            <SalonSidebar salon={salon} />
          </RevealAnimations>
        </div>
      </section>

      {lightboxIdx !== null && (
        <SalonLightbox
          photos={salon.photos}
          index={lightboxIdx}
          color={c}
          onClose={() => setLightboxIdx(null)}
          onSelect={(i) => setLightboxIdx(i)}
        />
      )}
    </div>
  );
};

export default SalonPageContent;
