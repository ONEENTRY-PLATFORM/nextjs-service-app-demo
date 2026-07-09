// Reviews shown in the home page carousel.
// Source: static-html/src/app/data/reviews.ts — until reviews move to the CMS.
export const reviewsData = [
  {
    title: 'Marina K.',
    text: 'Sofia transformed my balayage — the dimension and softness are unreal. Best colourist in Dubai, hands down.',
    rating: 5,
  },
  {
    title: 'Daniel P.',
    text: 'Finally a colourist who understands cool blondes. Noah nailed the global blonde with zero brassiness.',
    rating: 5,
  },
  {
    title: 'Nadia F.',
    text: 'Cleanest gel manicure I have had in years. The nail art is delicate and lasted three full weeks.',
    rating: 5,
  },
  {
    title: 'Priya N.',
    text: 'HIFU + facial combo left my skin glowing for weeks. Bianca explained every step — felt in safe hands.',
    rating: 5,
  },
];

export const socialData = [
  {
    title: 'Instagram',
    icon: 'instagram',
    link: '#1',
  },
  {
    title: 'Facebook',
    icon: 'facebook',
    link: '#2',
  },
  {
    title: 'Twitter',
    icon: 'twitter',
    link: '#3',
  },
];

export const copyrightsData = {
  date: '@ 2026 ',
  company: 'Thalia Beauty Studio',
};

// Offer card accent gradients — Thalia brand accents (tokens in app/globals.css).
export const gradients = [
  'linear-gradient(135deg, var(--color-accent-cyan-light), var(--color-accent-cyan))',
  'linear-gradient(135deg, var(--color-accent-pink-bright), var(--color-accent-pink))',
  'linear-gradient(135deg, var(--color-accent-purple-soft), var(--color-accent-purple))',
  'linear-gradient(135deg, var(--color-accent-cyan-light), var(--color-accent-cyan))',
  'linear-gradient(135deg, var(--color-accent-pink-bright), var(--color-accent-pink))',
  'linear-gradient(135deg, var(--color-accent-purple-soft), var(--color-accent-purple))',
  'linear-gradient(135deg, var(--color-accent-cyan-light), var(--color-accent-cyan))',
  'linear-gradient(135deg, var(--color-accent-pink-bright), var(--color-accent-pink))',
];

// Fine print for the Offers page ("Good to know" block).
// Source: static-html/src/app/data/offers.ts OFFER_TERMS — until it moves to the CMS.
export const offerTermsData = [
  'Valid through the end of the current month.',
  'Cannot be combined with other promotions or loyalty discounts.',
  'Subject to specialist availability — book ahead for weekends.',
  'Full package must be redeemed in a single visit.',
];

// Salon filter options of the masters page demo roster — the three studios
// from the static-html mock. Used while stage-4 masters are not in the CMS
// (see app/masters/getLocalMasters.ts).
export const localSalonsData = [
  {
    id: 'downtown',
    name: 'Thalia Downtown',
    address: 'Sheikh Mohammed bin Rashid Blvd, Downtown Dubai',
  },
  {
    id: 'marina',
    name: 'Thalia Marina',
    address: 'Marina Walk, Dubai Marina',
  },
  {
    id: 'jbr',
    name: 'Thalia JBR',
    address: 'The Walk, Jumeirah Beach Residence',
  },
];

// Salon folder in `public/images/Beauty content/Specialist/` per demo salon id.
export const salonFoldersData = {
  downtown: 'Downtown',
  marina: 'Marina',
  jbr: 'JBR',
};

// Demo roster of the masters page — the 32 specialists from the static-html
// mock (`MastersPage.tsx` → SECTIONS), grouped by profession section; each
// specialist is a [name, role base, salon id] tuple.
export const localMasterSectionsData = [
  {
    section: 'hair-stylist',
    categories: ['HAIR'],
    masters: [
      ['Sofia Marchetti', 'Top Stylist', 'downtown'],
      ['Nicolas Costa', 'Top Stylist', 'downtown'],
      ['Fatima Al Saadi', 'Senior Stylist', 'downtown'],
      ['Noah Jhonson', 'Top Stylist', 'marina'],
      ['Eva Lindholm', 'Senior Stylist', 'marina'],
      ['Aisha Al Mansoori', 'Stylist', 'marina'],
      ['Samir Haddad', 'Top Stylist', 'jbr'],
      ['Beatriz Almeida', 'Top Stylist', 'jbr'],
      ['Klara Novotná', 'Senior Stylist', 'jbr'],
      ['Tom Lindqvist', 'Stylist', 'jbr'],
      ['Lucia Ferrari', 'Stylist', 'jbr'],
    ],
  },
  {
    section: 'beauty-therapist',
    categories: ['FACE', 'BODY'],
    masters: [
      ['Layla Hadid', 'Master Therapist', 'downtown'],
      ['Elena Popescu', 'Master Therapist', 'downtown'],
      ['Kate Kinsly', 'Master Therapist', 'downtown'],
      ['Mariam Al Zaabi', 'Master Therapist', 'downtown'],
      ['Sarah Bennett', 'Master Therapist', 'marina'],
      ['Magdalena Kowalski', 'Master Therapist', 'marina'],
      ['Jamil Walid', 'Master Therapist', 'marina'],
      ['Noor Khalil', 'Master Therapist', 'marina'],
      ['Amal Al Hashimi', 'Master Therapist', 'jbr'],
      ['Bianca Schneider', 'Master Therapist', 'jbr'],
      ['Salma Othman', 'Master Therapist', 'jbr'],
      ['Yasmin Al Kaabi', 'Master Therapist', 'jbr'],
      ['Zaynab Al Marzooqi', 'Master Therapist', 'jbr'],
    ],
  },
  {
    section: 'makeup-artist',
    categories: ['FACE'],
    masters: [
      ['Camille Dubois', 'Makeup Specialist', 'downtown'],
      ['Isabella Romano', 'Makeup Specialist', 'marina'],
      ['Laila Mansour', 'Makeup Specialist', 'jbr'],
    ],
  },
  {
    section: 'nail-technician',
    categories: ['NAILS'],
    masters: [
      ['Adriana Iliescu', 'Nail Specialist', 'downtown'],
      ['Veronika Novak', 'Nail Specialist', 'downtown'],
      ['Stefania Vasiliou', 'Nail Specialist', 'marina'],
      ['Hana Choi', 'Nail Specialist', 'marina'],
      ['Mira Hassan', 'Nail Specialist', 'jbr'],
    ],
  },
];

// Offer accent color → light→dark gradient pairs from the static-html mock
// (`data/offers.ts`). Keys are lowercase hex values of the `offer_type`
// extended value.
export const offerAccentGradientsData = {
  '#109aa9': 'linear-gradient(135deg,#26d2e6,#109aa9)',
  '#ed21f1': 'linear-gradient(135deg,#f60efb,#ed21f1)',
  '#9b4fb2': 'linear-gradient(135deg,#7e63ae,#9b4fb2)',
};

// Local offer banners (copied from the static-html mock) used while offer
// products in the CMS have no photo attribute filled — cycled by card index.
export const offerBannersData = [
  '/images/Offer/banner_01.jpeg',
  '/images/Offer/banner_main.jpeg',
  '/images/Offer/banner_02.jpeg',
  '/images/Offer/banner_04.jpeg',
];

// Fallback photo of the contacts location cards when the location name is
// not recognized.
export const defaultSalonPhoto =
  '/images/Beauty content/Contacts/Downtown/Downtown_01.jpeg';

// Salon location photos shipped with the layout, keyed by location name.
export const salonPhotosData = {
  downtown: defaultSalonPhoto,
  marina: '/images/Beauty content/Contacts/Marina/Marina_01.jpeg',
  jbr: '/images/Beauty content/Contacts/JBR/JBR_01.jpeg',
};

export const orderStates = [
  {
    title: 'Upcoming',
    value: 'upcoming',
  },
  {
    title: 'Canceled',
    value: 'canceled',
  },
  {
    title: 'Completed',
    value: 'completed',
  },
];
