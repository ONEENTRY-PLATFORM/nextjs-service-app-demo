'use client';

import { Check, ChevronRight, Clock } from 'lucide-react';
import Image from 'next/image';
import { useTransitionRouter } from 'next-transition-router';
import type { IProductsEntity } from 'oneentry/dist/products/productsInterfaces';
import type { JSX } from 'react';

import CardAnimations from '@/app/animations/CardAnimations';
import { useGetPageByIdQuery } from '@/app/api';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {
  addServiceToCart,
  selectActiveItemId,
  setTabsState,
} from '@/app/store/reducers/CartSlice';
import { offerAccentGradientsData, offerBannersData } from '@/components/data';
import Dirham from '@/components/shared/Dirham';

/**
 * Brand accent pairs from the static-html mock (`components/data.js`): each
 * known accent color maps to its light→dark gradient. Unknown accents fall
 * back to a same-color gradient like the home page `OfferCard`.
 */
const ACCENT_GRADIENTS: Record<string, string> = offerAccentGradientsData;

/**
 * Local offer banners (mock data from `components/data.js`) used while offer
 * products in the CMS have no photo attribute filled — cycled by card index
 * in the mock's order.
 */
const FALLBACK_IMAGES: string[] = offerBannersData;

/**
 * OfferDetailCard component — a full-width special-offer card as in the
 * static-html mock (`OffersPage.tsx` → `OfferDetail`): photo with a discount
 * badge and price overlay on the left, an accent-gradient panel with the
 * name, description, bundled services and a "Book Offer" button on the
 * right, and a duration pill in the top-right corner.
 *
 * The button adds the offer to the booking cart and navigates to the booking
 * page — same flow as the home page `OfferCard`.
 * @param   {object}          props         - Component properties
 * @param   {IProductsEntity} props.product - Product entity representing the special offer (`offer`)
 * @param   {number}          props.index   - Card index — used for animation stagger and the fallback photo
 * @returns {JSX.Element}                   Special-offer detail card
 */
const OfferDetailCard = ({
  product,
  index,
}: {
  product: IProductsEntity;
  index: number;
}): JSX.Element => {
  /** Get router instance for navigation */
  const router = useTransitionRouter();
  /** Get dispatch function for Redux actions */
  const dispatch = useAppDispatch();
  /** Active cart row index */
  const activeId = useAppSelector(selectActiveItemId);

  /** Offer data from CMS attributes */
  const name = product.localizeInfos?.title ?? '';
  const attrDescription = product.attributeValues?.description?.value;
  const description =
    typeof attrDescription === 'string' && attrDescription
      ? attrDescription
      : ((product.localizeInfos?.plainValue as string | undefined) ?? '');
  const servicesArr = product.attributeValues?.services?.value as
    Array<{ title?: string; parentId?: number }> | undefined;
  const services =
    servicesArr?.map((service) => service.title).filter(Boolean) ?? [];
  const price = product.price ?? 0;
  const original =
    (product.attributeValues?.sale?.value as number | undefined) || 0;
  const discount =
    original > price && price > 0
      ? Math.round(((original - price) / original) * 100)
      : 0;
  const offerTypeArr = product.attributeValues?.offer_type?.value as
    Array<{ value?: string; extended?: { value?: string } }> | undefined;
  const accentColor = offerTypeArr?.[0]?.extended?.value || '#ed21f1';
  const accentGrad =
    ACCENT_GRADIENTS[accentColor.toLowerCase()] ??
    `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`;

  /** Offer photo: `image` attribute or a local mock banner cycled by index */
  const imageArr = product.attributeValues?.image?.value as
    Array<{ downloadLink?: string }> | undefined;
  const image =
    imageArr?.[0]?.downloadLink ||
    (FALLBACK_IMAGES[index % FALLBACK_IMAGES.length] as string);

  /** Approximate appointment time: `duration` attribute, number = minutes */
  const rawDuration = product.attributeValues?.duration?.value;
  const duration =
    typeof rawDuration === 'string' && rawDuration
      ? rawDuration
      : typeof rawDuration === 'number'
        ? `${rawDuration} min`
        : '';

  /** Category page of the first bundled service — needed for the booking cart */
  const { data: service } = useGetPageByIdQuery({
    id: servicesArr?.[0]?.parentId ?? 0,
  });

  /**
   * Add the offer to the booking cart and navigate to the booking page
   * @returns {void}
   */
  const handleBook = () => {
    /** Don't proceed if service data is not available */
    if (!service) {
      return;
    }
    dispatch(
      addServiceToCart({
        id: activeId,
        serviceId: service.id,
        productId: product.id,
        salonId: null,
        masterId: null,
        date: null,
      }),
    );
    dispatch(setTabsState({ key: 'services', value: true }));
    dispatch(setTabsState({ key: 'products', value: true }));
    router.push('/booking');
  };

  return (
    <CardAnimations
      index={index}
      className="relative grid grid-cols-1 overflow-hidden rounded-3xl md:grid-cols-[320px_1fr]"
      style={{ boxShadow: `0 18px 50px ${accentColor}40` }}
    >
      {/* Duration — top-right corner */}
      {duration && (
        <span
          className="absolute top-5 right-5 z-10 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
          style={{
            background: 'rgba(255,255,255,0.22)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <Clock size={16} /> {duration}
        </span>
      )}

      {/* Left — full-bleed photo with price overlay */}
      <div className="relative min-h-60">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 320px"
          className="object-cover"
        />
        {discount > 0 && (
          <span
            className="absolute top-4 left-4 rounded-full px-4 py-1.5 text-base font-black text-white"
            style={{
              background: accentColor,
              boxShadow: `0 4px 12px ${accentColor}66`,
            }}
          >
            -{discount}%
          </span>
        )}
        <div
          className="absolute inset-x-0 bottom-0 flex items-end gap-2 p-4"
          style={{
            background: 'linear-gradient(transparent, rgba(0,0,0,0.5))',
          }}
        >
          <span
            className="flex items-baseline leading-none font-black text-white"
            style={{ fontSize: '1.9rem' }}
          >
            <Dirham big />
            {price}
          </span>
          {original > 0 && (
            <span
              className="mb-0.5 flex items-baseline text-sm line-through"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              <Dirham />
              {original}
            </span>
          )}
        </div>
      </div>

      {/* Right — accent gradient content panel */}
      <div
        className="flex flex-col p-7 md:p-9"
        style={{ background: accentGrad }}
      >
        <h2
          className="mb-2 font-light text-white"
          style={{ fontSize: '1.7rem' }}
        >
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
            onClick={handleBook}
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
    </CardAnimations>
  );
};

export default OfferDetailCard;
