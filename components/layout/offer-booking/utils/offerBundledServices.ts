import type {
  BookingService,
} from '@/components/layout/booking-page/types';

/**
 * offerBundledServices — resolve the offer's bundled service product ids into
 * the wizard's service objects. The order the modal posts books these services
 * (the offer product itself is not bookable), and their durations add up to
 * the appointment length.
 *
 * Ids the catalog does not carry (a service unpublished since the offer was
 * curated) are silently dropped — the modal books what still exists rather
 * than failing the whole package.
 * @param   {BookingService[]} services          - The full bookable catalog
 * @param   {number[]}         serviceProductIds - Product ids from `offer_services`
 * @returns {BookingService[]}                   Bundled services present in the catalog
 */
export const offerBundledServices = (
  services: BookingService[],
  serviceProductIds: number[],
): BookingService[] =>
  services.filter(
    (service) =>
      service.productId !== null &&
      serviceProductIds.includes(service.productId),
  );
