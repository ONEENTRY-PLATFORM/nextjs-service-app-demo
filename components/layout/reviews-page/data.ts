/**
 * Reviews data ported verbatim from the static-html mock
 * (`static-html/src/app/data/reviews.ts`).
 *
 * Temporary local data source: while the reviews section of the CMS is not
 * populated, the `/reviews` page is driven by this module (mirrors how
 * `components/data/reviewsData.ts` and
 * `components/layout/gallery-page/taxonomy.ts` document their local-data
 * status). Move to OneEntry once the reviews storage is filled.
 */

/**
 * A single customer review.
 * @property {string} id     - Stable id, e.g. `r1`
 * @property {string} author - Customer name
 * @property {string} master - Specialist name (matches the Specialist roster)
 * @property {number} rating - Rating, 1–5
 * @property {string} date   - Display date
 * @property {string} text   - Review body
 */
export type Review = {
  id: string;
  author: string;
  master: string;
  rating: number;
  date: string;
  text: string;
};

/**
 * A salon location shown in the salon filter.
 * @property {string} id      - Salon id (same ids used across the site)
 * @property {string} name    - Salon display name
 * @property {string} address - Salon street address
 */
export type ReviewSalon = {
  id: string;
  name: string;
  address: string;
};

/** Service category a master belongs to. */
export type MasterCategory = 'Hair' | 'Face' | 'Body' | 'Nails';

/** Salons (same ids/names used across the site). */
export const REVIEW_SALONS: ReviewSalon[] = [
  {
    id: 'downtown',
    name: 'Thalia Downtown',
    address: 'Sheikh Mohammed bin Rashid Blvd, Downtown Dubai',
  },
  { id: 'marina', name: 'Thalia Marina', address: 'Marina Walk, Dubai Marina' },
  {
    id: 'jbr',
    name: 'Thalia JBR',
    address: 'The Walk, Jumeirah Beach Residence',
  },
];

/** Which salon each master works at. */
export const MASTER_SALON: Record<string, string> = {
  'Sofia Marchetti': 'downtown',
  'Noah Jhonson': 'marina',
  'Samir Haddad': 'jbr',
  'Camille Dubois': 'downtown',
  'Adriana Iliescu': 'downtown',
  'Bianca Schneider': 'jbr',
  'Klara Novotná': 'jbr',
  'Hana Choi': 'marina',
  'Mira Hassan': 'jbr',
  'Laila Mansour': 'jbr',
};

/** Service category each master belongs to (matches the Specialist roster). */
export const MASTER_CAT: Record<string, MasterCategory> = {
  'Sofia Marchetti': 'Hair',
  'Noah Jhonson': 'Hair',
  'Samir Haddad': 'Hair',
  'Klara Novotná': 'Hair',
  'Camille Dubois': 'Face',
  'Bianca Schneider': 'Face',
  'Laila Mansour': 'Face',
  'Adriana Iliescu': 'Nails',
  'Hana Choi': 'Nails',
  'Mira Hassan': 'Nails',
};

/** All customer reviews. */
export const REVIEWS: Review[] = [
  {
    id: 'r1',
    author: 'Marina K.',
    master: 'Sofia Marchetti',
    rating: 5,
    date: '12 May 2026',
    text: 'Sofia transformed my balayage — the dimension and softness are unreal. Best colourist in Dubai, hands down.',
  },
  {
    id: 'r2',
    author: 'Aisha R.',
    master: 'Sofia Marchetti',
    rating: 5,
    date: '28 Apr 2026',
    text: 'Bridal hairstyle that lasted the whole event in 38°C. Gentle, precise and genuinely lovely to chat with.',
  },
  {
    id: 'r3',
    author: 'Elena V.',
    master: 'Sofia Marchetti',
    rating: 4,
    date: '03 Apr 2026',
    text: 'Gorgeous result, took a little longer than booked — but the airtouch was worth every minute.',
  },
  {
    id: 'r4',
    author: 'Daniel P.',
    master: 'Noah Jhonson',
    rating: 5,
    date: '09 May 2026',
    text: 'Finally a colourist who understands cool blondes. Noah nailed the global blonde with zero brassiness.',
  },
  {
    id: 'r5',
    author: 'Sophie L.',
    master: 'Noah Jhonson',
    rating: 5,
    date: '21 Mar 2026',
    text: 'Olaplex treatment brought my over-processed hair back to life. Honest advice, no upselling.',
  },
  {
    id: 'r6',
    author: 'Hana M.',
    master: 'Samir Haddad',
    rating: 5,
    date: '14 May 2026',
    text: 'Samir is an artist. My evening updo got endless compliments. Calm hands and great taste.',
  },
  {
    id: 'r7',
    author: 'Reem A.',
    master: 'Samir Haddad',
    rating: 4,
    date: '30 Apr 2026',
    text: 'Beautiful bridal trial. JBR studio is a touch busy on weekends but the work speaks for itself.',
  },
  {
    id: 'r8',
    author: 'Camilla T.',
    master: 'Camille Dubois',
    rating: 5,
    date: '07 May 2026',
    text: "Evening makeup that photographed flawlessly and didn't budge. Lash work is next level.",
  },
  {
    id: 'r9',
    author: 'Yara S.',
    master: 'Camille Dubois',
    rating: 5,
    date: '19 Apr 2026',
    text: 'Natural everyday look exactly as I asked — skin looked like skin, not a mask. Will be back.',
  },
  {
    id: 'r10',
    author: 'Nadia F.',
    master: 'Adriana Iliescu',
    rating: 5,
    date: '11 May 2026',
    text: "Cleanest gel manicure I've had in years. The nail art is delicate and lasted three full weeks.",
  },
  {
    id: 'r11',
    author: 'Olga D.',
    master: 'Adriana Iliescu',
    rating: 4,
    date: '02 Apr 2026',
    text: 'Lovely combined manicure and very hygienic. Booking can fill up fast, so plan ahead.',
  },
  {
    id: 'r12',
    author: 'Priya N.',
    master: 'Bianca Schneider',
    rating: 5,
    date: '16 May 2026',
    text: 'HIFU + facial combo left my skin glowing for weeks. Bianca explained every step — felt in safe hands.',
  },
  {
    id: 'r13',
    author: 'Laura B.',
    master: 'Bianca Schneider',
    rating: 5,
    date: '25 Mar 2026',
    text: 'Microneedling results are visible already. Professional, gentle and genuinely knowledgeable.',
  },
  {
    id: 'r14',
    author: 'Kristina P.',
    master: 'Klara Novotná',
    rating: 5,
    date: '08 May 2026',
    text: 'Evening hairstyle for a gala — elegant, secure and exactly the reference I brought. Highly recommend.',
  },
  {
    id: 'r15',
    author: 'Mei L.',
    master: 'Hana Choi',
    rating: 5,
    date: '13 May 2026',
    text: 'Gel pedicure perfection. Relaxing, spotless studio and the colour match was perfect.',
  },
  {
    id: 'r16',
    author: 'Fatima H.',
    master: 'Mira Hassan',
    rating: 4,
    date: '29 Apr 2026',
    text: 'Lovely classic manicure and very sweet service. A calm, clean experience at JBR.',
  },
  {
    id: 'r17',
    author: 'Sara W.',
    master: 'Laila Mansour',
    rating: 5,
    date: '05 May 2026',
    text: "Volume lashes + bridal makeup for my sister's wedding — both of us looked incredible. Thank you Laila!",
  },
];
