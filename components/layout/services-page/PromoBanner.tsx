import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { IAttributeValues } from 'oneentry/types';
import type { JSX } from 'react';

import RevealAnimations from '@/app/animations/RevealAnimations';
import { ServerProvider } from '@/app/store/providers/ServerProvider';
import { dictText } from '@/components/utils/dictText';

/**
 * PromoBanner component — the "First Visit? Get 15% Off" gradient banner at
 * the bottom of the services page. The button leads to the booking
 * page. Texts are English fallbacks until `system_content` is set up in the
 * CMS.
 *
 * Wrapped in {@link RevealAnimations} so the banner slides up and fades in as it
 * scrolls into view and fades away on page transitions.
 * @returns {JSX.Element} Promo banner section
 */
const PromoBanner = (): JSX.Element => {
  const [dict] = ServerProvider<IAttributeValues>('dict');
  return (
    <section className="py-10">
      <RevealAnimations className="page-shell">
        <div className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-3xl bg-gradient-promo px-8 py-10 transition-transform duration-300 hover:scale-101 md:flex-row">
          <div
            className="absolute -top-12 -right-12 size-48 rounded-full opacity-20"
            style={{ background: 'rgba(255,255,255,0.4)' }}
          />
          <div
            className="absolute -bottom-8 -left-8 size-32 rounded-full opacity-15"
            style={{ background: 'rgba(255,255,255,0.5)' }}
          />

          <div className="relative text-center md:text-left">
            <span
              className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase"
              style={{ background: 'rgba(255,255,255,0.25)', color: '#fff' }}
            >
              <Sparkles size={17} className="-mt-0.5 mr-1 inline" />{' '}
              {dictText(dict, 'promo_limited_offer_text', 'Limited Offer')}
            </span>
            <h3
              className="mb-1 font-black text-white"
              style={{ fontSize: 'clamp(1.3rem,2.5vw,1.8rem)' }}
            >
              {dictText(
                dict,
                'promo_first_visit_title',
                'First Visit? Get 15% Off',
              )}
            </h3>
            <p className="max-w-sm text-base text-white/80">
              {dictText(
                dict,
                'promo_first_visit_desc',
                'Book any service for your first visit and enjoy an exclusive welcome discount.',
              )}
            </p>
          </div>

          <Link
            href="/booking"
            className="relative shrink-0 rounded-xl px-8 py-3.5 text-base font-black tracking-wider uppercase transition-transform duration-200 hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.22)',
              color: '#fff',
              border: '2px solid rgba(255,255,255,0.5)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {dictText(dict, 'book_now_text', 'Book Now')}
          </Link>
        </div>
      </RevealAnimations>
    </section>
  );
};

export default PromoBanner;
