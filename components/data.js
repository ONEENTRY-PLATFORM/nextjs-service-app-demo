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

// Contacts page demo studios — the three salons from the static-html mock
// (`ContactsPage.tsx` → SALONS). Used while the CMS salon pages have no
// `salon_address` attribute filled.
export const contactSalonsData = [
  {
    id: 's1',
    name: 'Thalia Downtown',
    address: 'Sheikh Mohammed bin Rashid Blvd, Downtown Dubai',
    phone: '+971 4 701 2200',
    tel: '+97147012200',
    mapSrc:
      'https://www.google.com/maps?q=25.1972,55.2744&z=15&hl=en&output=embed',
    mapsLink:
      'https://www.google.com/maps/dir/?api=1&destination=25.1972,55.2744',
    color: '#ed21f1',
  },
  {
    id: 's2',
    name: 'Thalia Marina',
    address: 'Marina Walk, Dubai Marina',
    phone: '+971 4 702 3300',
    tel: '+97147023300',
    mapSrc:
      'https://www.google.com/maps?q=25.0808,55.1414&z=15&hl=en&output=embed',
    mapsLink:
      'https://www.google.com/maps/dir/?api=1&destination=25.0808,55.1414',
    color: '#109aa9',
  },
  {
    id: 's3',
    name: 'Thalia JBR',
    address: 'The Walk, Jumeirah Beach Residence',
    phone: '+971 4 703 4400',
    tel: '+97147034400',
    mapSrc:
      'https://www.google.com/maps?q=25.0801,55.1357&z=15&hl=en&output=embed',
    mapsLink:
      'https://www.openstreetmap.org/?mlat=25.0801&mlon=55.1357#map=15/25.0801/55.1357',
    color: '#9b4fb2',
  },
];

// "Reach out" cards of the contacts page — the mock's hardcoded studio
// contacts (`ContactsPage.tsx` → ContactInfo) until they move to the CMS.
export const contactInfoData = [
  {
    icon: 'phone',
    label: 'General phone',
    value: '+971 4 784 0098',
    color: '#ed21f1',
    href: 'tel:+97147840098',
  },
  {
    icon: 'mail',
    label: 'E-mail us',
    value: 'hello@beautystudio.com',
    color: '#109aa9',
    href: 'mailto:hello@beautystudio.com',
  },
  {
    icon: 'map-pin',
    label: 'Head office',
    value: 'Sheikh Mohammed bin Rashid Blvd, Downtown Dubai',
    color: '#9b4fb2',
    href: '#',
  },
  {
    icon: 'clock',
    label: 'Working hours',
    value: 'Daily 10:00–22:00',
    color: '#9b4fb2',
    href: '#',
  },
];

// Weekly schedule of the contacts page ("Opening Hours" section) — mock data
// (`ContactsPage.tsx` → HOURS) until the `opening_time` block is filled in
// the CMS.
export const openingHoursData = [
  { day: 'Monday', hours: '10:00 – 22:00' },
  { day: 'Tuesday', hours: '10:00 – 22:00' },
  { day: 'Wednesday', hours: '10:00 – 22:00' },
  { day: 'Thursday', hours: '10:00 – 22:00' },
  { day: 'Friday', hours: '10:00 – 22:00' },
  { day: 'Saturday', hours: '10:00 – 22:00' },
  { day: 'Sunday', hours: '10:00 – 22:00' },
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

// Booking wizard demo services — the 17 bookable services from the
// static-html mock (`App.tsx` → SERVICES). Used while the CMS holds no
// products (see app/booking/getLocalBookingData.ts).
export const bookingServicesData = [
  {
    id: 'sv1',
    category: 'Hair',
    name: 'Haircut',
    duration: '60 min',
    price: 260,
  },
  {
    id: 'sv2',
    category: 'Hair',
    name: 'Coloring',
    duration: '150 min',
    price: 550,
  },
  {
    id: 'sv3',
    category: 'Hair',
    name: 'Styling',
    duration: '45 min',
    price: 180,
  },
  {
    id: 'sv4',
    category: 'Nails',
    name: 'Manicure',
    duration: '45 min',
    price: 120,
  },
  {
    id: 'sv5',
    category: 'Nails',
    name: 'Pedicure',
    duration: '60 min',
    price: 180,
  },
  {
    id: 'sv6',
    category: 'Face',
    name: 'Day Makeup',
    duration: '45 min',
    price: 290,
  },
  {
    id: 'sv7',
    category: 'Face',
    name: 'Evening Makeup',
    duration: '60 min',
    price: 450,
  },
  {
    id: 'sv8',
    category: 'Body',
    name: 'Relax Massage',
    duration: '60 min',
    price: 380,
  },
  {
    id: 'sv9',
    category: 'Body',
    name: 'Hot Stone Massage',
    duration: '75 min',
    price: 560,
  },
  {
    id: 'sv10',
    category: 'Body',
    name: 'Moroccan Bath',
    duration: '60 min',
    price: 450,
  },
  {
    id: 'sv11',
    category: 'Body',
    name: 'Henna Hand Design',
    duration: '45 min',
    price: 180,
  },
  {
    id: 'sv12',
    category: 'Hair',
    name: 'Keratin Treatment',
    duration: '180 min',
    price: 1000,
  },
  {
    id: 'sv13',
    category: 'Face',
    name: 'Express Facial',
    duration: '30 min',
    price: 260,
  },
  {
    id: 'sv14',
    category: 'Face',
    name: 'Chemical Peel',
    duration: '45 min',
    price: 550,
  },
  {
    id: 'sv15',
    category: 'Face',
    name: 'Brow Shaping',
    duration: '30 min',
    price: 110,
  },
  {
    id: 'sv16',
    category: 'Body',
    name: 'Detox Wrap',
    duration: '75 min',
    price: 560,
  },
  {
    id: 'sv17',
    category: 'Body',
    name: 'Full Legs Waxing',
    duration: '45 min',
    price: 260,
  },
];

// Booking wizard demo roster metadata per profession section of
// `localMasterSectionsData` — which demo services the section performs, the
// specialties line of the card and the "from" price (mock `App.tsx` → MASTERS).
export const bookingSectionMetaData = {
  'hair-stylist': {
    specialties: ['Hair'],
    serviceIds: ['sv1', 'sv2', 'sv3', 'sv12'],
    price: 180,
  },
  'beauty-therapist': {
    specialties: ['Face', 'Body'],
    serviceIds: [
      'sv8',
      'sv9',
      'sv10',
      'sv11',
      'sv13',
      'sv14',
      'sv15',
      'sv16',
      'sv17',
    ],
    price: 110,
  },
  'makeup-artist': {
    specialties: ['Makeup'],
    serviceIds: ['sv6', 'sv7', 'sv15'],
    price: 110,
  },
  'nail-technician': {
    specialties: ['Manicure', 'Pedicure'],
    serviceIds: ['sv4', 'sv5'],
    price: 120,
  },
};

// "Any specialist" team photo per demo salon id (mock `BookingPage.tsx` →
// ANY_GROUP); the booking wizard falls back to Downtown when no salon chosen.
export const anySpecialistPhotosData = {
  downtown: '/images/Any_specialist/Downtown_group.jpg',
  marina: '/images/Any_specialist/Marina_group.jpg',
  jbr: '/images/Any_specialist/JBR_group.jpg',
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
