import {
  bookingSectionMetaData,
  bookingServicesData,
  contactSalonsData,
  localMasterSectionsData,
  localSalonsData,
  salonFoldersData,
} from '@/components/data';
import type {
  BookingData,
  BookingMaster,
  BookingSalon,
  BookingService,
} from '@/components/layout/booking-page/types';

/**
 * Local demo data for the booking wizard — the salons, the 17 bookable
 * services and the 32-specialist roster from the static-html mock
 * (`App.tsx` → SALONS / SERVICES / MASTERS), with portraits from
 * `public/images/Beauty content/Specialist/<Salon>/<Name>.jpeg`.
 *
 * Temporary data source: used while the CMS holds no service products or no
 * `master_*` admins (content plan, stage 4). Once both exist,
 * `app/booking/booking-data.ts` switches to the CMS automatically and this
 * file becomes unused. Demo bookings show the success modal without creating
 * an order — there are no CMS entities to reference.
 *
 * The raw data lives in `components/data.js` (the shared mock-data file);
 * this module only types it and assembles the normalized wizard payload.
 */

/** Demo services typed for the wizard */
const LOCAL_SERVICES: BookingService[] = (
  bookingServicesData as {
    id: string;
    category: string;
    name: string;
    duration: string;
    price: number;
  }[]
).map((s) => ({ ...s, productId: null, categoryId: null }));

/** Roster metadata per profession section (services / specialties / price) */
const SECTION_META = bookingSectionMetaData as Record<
  string,
  { specialties: string[]; serviceIds: string[]; price: number }
>;

/** Demo salons: the masters-page studios + phones of the contacts mock */
const LOCAL_SALONS: BookingSalon[] = (
  localSalonsData as { id: string; name: string; address: string }[]
).map((salon, idx) => ({
  ...salon,
  phone: (contactSalonsData as { phone: string }[])[idx]?.phone ?? '',
}));

/**
 * Build the demo wizard payload from the shared mock-data tables.
 * @returns {BookingData} Salons, services and specialists of the demo mode
 */
const getLocalBookingData = (): BookingData => {
  const sections = localMasterSectionsData as unknown as {
    section: string;
    masters: [string, string, string][];
  }[];
  const folders = salonFoldersData as Record<string, string>;

  const masters: BookingMaster[] = sections.flatMap(
    ({ section, masters: rows }) => {
      const meta = SECTION_META[section];
      return rows.map(([name, roleBase, salonId], idx) => {
        const folder = folders[salonId] ?? '';
        const serviceIds = meta?.serviceIds ?? [];
        const signature = serviceIds
          .slice(0, 4)
          .map((sid) => LOCAL_SERVICES.find((s) => s.id === sid)?.name)
          .filter(Boolean)
          .join(', ');
        return {
          id: name,
          adminId: null,
          name,
          grade: roleBase,
          photo: encodeURI(
            `/images/Beauty content/Specialist/${folder}/${name}.jpeg`,
          ),
          specialties: meta?.specialties ?? [],
          rating: 5,
          /** Deterministic pseudo review count in the mock's 190–590 range */
          reviews: 190 + ((name.length * 31 + idx * 53) % 400),
          price: meta?.price ?? null,
          bio: `${roleBase} at Thalia ${folder}. Signature services: ${signature}.`,
          salonIds: [salonId],
          serviceIds,
        };
      });
    },
  );

  return {
    salons: LOCAL_SALONS,
    services: LOCAL_SERVICES,
    masters,
    demo: true,
  };
};

export default getLocalBookingData;
