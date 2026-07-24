'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { JSX } from 'react';
import { useState } from 'react';

import RevealAnimations from '@/app/animations/RevealAnimations';
import { useDict } from '@/app/store/providers/useDict';

import SalonTopBarAnimations from './animations/SalonTopBarAnimations';
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
  const dict = useDict();
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const c = salon.color;

  return (
    <div className="bg-white" data-testid="salon-page">
      {/* Gradient strip — grows in from the left edge */}
      <SalonTopBarAnimations mode="grow">
        <div className="h-1.25 bg-gradient-stats" />
      </SalonTopBarAnimations>

      {/* Back link — slides in from the left */}
      <SalonTopBarAnimations mode="slide" className="page-shell pt-6" delay={0.1}>
        <Link
          href="/contacts"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 transition-opacity hover:opacity-70"
        >
          <ArrowLeft size={16} />{' '}
          {(dict?.back_to_contacts_text?.value as string | undefined) ||
            'Back to Contacts'}
        </Link>
      </SalonTopBarAnimations>

      {/* Title + photo gallery */}
      <section className="pt-6 pb-10">
        <div className="page-shell">
          <RevealAnimations
            className="px-3 text-center lg:px-0 lg:text-left"
            delay={0.05}
          >
            <h1 className="inline-block border-b border-ink pb-1.5 text-[clamp(26px,4vw,2.6rem)] font-light tracking-fine text-ink uppercase">
              {salon.name}
            </h1>
          </RevealAnimations>
          <div className="mt-6">
            {salon.photos.length > 0 ? (
              <SalonPhotoGallery
                photos={salon.photos}
                accent={c}
                onOpen={setLightboxIdx}
              />
            ) : (
              <RevealAnimations>
                <p
                  data-testid="salon-no-photos"
                  className="py-10 text-center text-sm text-neutral-300"
                >
                  {(dict?.salon_no_photos_text?.value as string | undefined) ||
                    'This salon has no photos yet.'}
                </p>
              </RevealAnimations>
            )}
          </div>
        </div>
      </section>

      {/* About + sidebar */}
      <section className="pb-10">
        <div className="page-shell grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div className="px-3 lg:px-0">
            <RevealAnimations distance={24}>
              <p
                className="mb-3 text-sm font-black tracking-[0.25em] uppercase"
                style={{ color: c }}
              >
                {(dict?.about_studio_text?.value as string | undefined) ||
                  'About this studio'}
              </p>
            </RevealAnimations>
            <RevealAnimations delay={0.08}>
              {salon.about.map((para, i) => (
                <p
                  key={i}
                  className="mb-4 text-justify text-base leading-relaxed text-slate-400"
                >
                  {para}
                </p>
              ))}
            </RevealAnimations>

            {salon.highlights.length > 0 && (
              <RevealAnimations delay={0.16} className="mt-8 block">
                <ul className="grid grid-cols-1 gap-y-2">
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
              </RevealAnimations>
            )}
          </div>

          <SalonSidebar salon={salon} />
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
