/**
 * A customer review of the home-page carousel.
 * @property {string} title  - Reviewer name
 * @property {string} text   - Review body
 * @property {number} rating - Star rating, 1–5
 */
export interface ReviewEntry {
  title: string;
  text: string;
  rating: number;
}

/**
 * Reviews shown in the home page carousel.
 *
 * Source: `static-html/src/app/data/reviews.ts` — until reviews move to the CMS.
 */
export const reviewsData: ReviewEntry[] = [
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
