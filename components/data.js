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

// Fine print for the Offers page ("Good to know" block).
// Source: static-html/src/app/data/offers.ts OFFER_TERMS — until it moves to the CMS.
export const offerTermsData = [
  'Valid through the end of the current month.',
  'Cannot be combined with other promotions or loyalty discounts.',
  'Subject to specialist availability — book ahead for weekends.',
  'Full package must be redeemed in a single visit.',
];

// Offer accent color → light→dark gradient pairs from the static-html mock
// (`data/offers.ts`). Keys are lowercase hex values of the `offer_type`
// extended value.
export const offerAccentGradientsData = {
  '#109aa9': 'linear-gradient(135deg,#26d2e6,#109aa9)',
  '#ed21f1': 'linear-gradient(135deg,#f60efb,#ed21f1)',
  '#9b4fb2': 'linear-gradient(135deg,#7e63ae,#9b4fb2)',
};

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

// "Any specialist" team photo per demo salon id (mock `BookingPage.tsx` →
// ANY_GROUP); the booking wizard falls back to Downtown when no salon chosen.
export const anySpecialistPhotosData = {
  downtown: '/images/Any_specialist/Downtown_group.jpg',
  marina: '/images/Any_specialist/Marina_group.jpg',
  jbr: '/images/Any_specialist/JBR_group.jpg',
};
