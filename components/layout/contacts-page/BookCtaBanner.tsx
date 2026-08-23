import Link from 'next/link';
import type { IAttributeValues } from 'oneentry/types';
import type { JSX } from 'react';

import { ServerProvider } from '@/app/store/providers/ServerProvider';
import { dictText } from '@/components/utils/dictText';

/**
 * BookCtaBanner component — the "Ready to visit us?" gradient banner at the
 * bottom of the contacts page. The button leads to the booking page. Texts are English
 * fallbacks until `system_content` is set up in the CMS.
 * @returns {JSX.Element} Booking CTA banner section
 */
const BookCtaBanner = (): JSX.Element => {
  const [dict] = ServerProvider<IAttributeValues>('dict');

  return (
    <section className="py-6 md:py-10">
      <div className="page-shell">
        <div className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-3xl bg-gradient-promo px-6 py-8 transition-transform duration-300 hover:scale-101 md:flex-row md:px-8 md:py-10">
          <div
            className="absolute -top-10 -right-10 size-44 rounded-full opacity-20"
            style={{ background: 'rgba(255,255,255,0.5)' }}
          />
          <div
            className="absolute -bottom-8 -left-8 size-28 rounded-full opacity-15"
            style={{ background: 'rgba(255,255,255,0.5)' }}
          />

          <div className="relative text-center md:text-left">
            <h3
              className="mb-1 font-black text-white"
              style={{ fontSize: 'clamp(1.3rem,2.5vw,1.8rem)' }}
            >
              {dictText(dict, 'ready_to_visit_title', 'Ready to visit us?')}
            </h3>
            <p className="max-w-sm text-base text-white/80">
              {dictText(
                dict,
                'ready_to_visit_desc',
                'Book your appointment online in just a few taps — choose your studio, service and master.',
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
            {dictText(dict, 'book_text', 'Book Online')}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BookCtaBanner;
