import { Check, ChevronRight } from 'lucide-react';
import type { JSX } from 'react';

/**
 * OfferDetailPanel — the right accent-gradient content pane of an offer detail
 * card: name, justified description, the "What's included" service list and
 * the "Book Offer" button.
 * @param   {object}      props             - Component properties
 * @param   {string}      props.name        - Offer name
 * @param   {string}      props.description - Offer description
 * @param   {string[]}    props.services    - Bundled service titles
 * @param   {string}      props.accentGrad  - Accent gradient background
 * @param   {() => void}  props.onBook      - Add the offer to the cart and go to booking
 * @returns {JSX.Element}                   Content pane
 */
const OfferDetailPanel = ({
  name,
  description,
  services,
  accentGrad,
  onBook,
}: {
  name: string;
  description: string;
  services: string[];
  accentGrad: string;
  onBook: () => void;
}): JSX.Element => (
  <div className="flex flex-col p-7 md:p-9" style={{ background: accentGrad }}>
    <h2 className="mb-2 font-light text-white" style={{ fontSize: '1.7rem' }}>
      {name}
    </h2>
    {description && (
      <p
        className="mb-6 max-w-2xl text-base leading-relaxed"
        style={{ color: 'rgba(255,255,255,0.85)', textAlign: 'justify' }}
      >
        {description}
      </p>
    )}

    {services.length > 0 && (
      <>
        <p
          className="mb-3 text-sm font-black tracking-widest uppercase"
          style={{ color: 'rgba(255,255,255,0.8)' }}
        >
          What&apos;s included
        </p>
        <div className="mb-7 flex flex-col gap-2.5">
          {services.map((serviceTitle) => (
            <div key={serviceTitle} className="flex items-center gap-2.5">
              <div
                className="flex size-5 shrink-0 items-center justify-center rounded-full"
                style={{ background: 'rgba(255,255,255,0.25)' }}
              >
                <Check size={16} color="#fff" />
              </div>
              <span
                className="text-base"
                style={{ color: 'rgba(255,255,255,0.92)' }}
              >
                {serviceTitle}
              </span>
            </div>
          ))}
        </div>
      </>
    )}

    <div className="mt-auto">
      <button
        onClick={onBook}
        className="flex items-center gap-1.5 rounded-xl px-8 py-3.5 text-base font-bold tracking-wider text-white uppercase transition-all hover:scale-[1.02] active:scale-[0.97]"
        style={{
          background: 'rgba(255,255,255,0.22)',
          border: '1.5px solid rgba(255,255,255,0.45)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.32)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.22)';
        }}
      >
        Book Offer <ChevronRight size={15} />
      </button>
    </div>
  </div>
);

export default OfferDetailPanel;
