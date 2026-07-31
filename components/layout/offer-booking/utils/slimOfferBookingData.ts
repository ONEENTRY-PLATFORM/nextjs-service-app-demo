import type {
  BookingData,
  BookingMaster,
} from '@/components/layout/booking-page/types';

/**
 * slimOfferBookingData — strips `BookingData` down to what the offer booking
 * modal actually reads before an RSC serializes it into the page payload.
 *
 * The modal's specialist rows show no bio, review count, price or LQIP (the
 * portrait is a 44 px avatar), so those fields ship as empty — that alone
 * trims tens of kilobytes of flight payload per page. The raw schedules stay:
 * they are what the slot grid runs on. The shape remains `BookingData`, so
 * the modal keeps reusing the wizard's typed machinery unchanged.
 * @param   {BookingData} data - Full wizard payload from `getBookingData`
 * @returns {BookingData}      The same data with the modal-unused master fields emptied
 */
export const slimOfferBookingData = (data: BookingData): BookingData => ({
  ...data,
  masters: data.masters.map((master): BookingMaster => ({
    id: master.id,
    adminId: master.adminId,
    name: master.name,
    grade: master.grade,
    photo: master.photo,
    specialties: master.specialties,
    rating: master.rating,
    reviews: null,
    price: null,
    bio: '',
    salonIds: master.salonIds,
    serviceIds: master.serviceIds,
    ...(master.schedule !== undefined ? { schedule: master.schedule } : {}),
  })),
});
