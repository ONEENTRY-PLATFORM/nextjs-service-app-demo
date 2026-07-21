/**
 * Local descriptive content for the salon detail page.
 *
 * The CMS salon pages hold only `salon_address` / `salon_phone`; the "About
 * this studio" copy, highlight bullets and accent color are kept here (English
 * fallbacks in code, mirroring `components/data/`) until they move to the
 * CMS. Keyed by the salon `pageUrl` (`downtown` / `marina` / `jbr`).
 */

/** Accent color per salon `pageUrl` — matches the Contacts card cycling. */
export const SALON_COLOR: Record<string, string> = {
  downtown: '#ed21f1',
  marina: '#109aa9',
  jbr: '#9b4fb2',
};

/** Descriptive copy (About paragraphs + highlight bullets) per salon. */
export const SALON_CONTENT: Record<
  string,
  { about: string[]; highlights: string[] }
> = {
  downtown: {
    about: [
      'Our flagship studio in the heart of Downtown Dubai blends couture styling with a serene, light-filled space. Every chair looks out over the city while our senior team crafts looks tailored to you.',
      'From precision cuts and dimensional colour to advanced skin and nail rituals, Thalia Downtown is where our most experienced specialists bring editorial technique to everyday beauty.',
    ],
    highlights: [
      'Senior stylists and master colourists',
      'Private VIP styling suite',
      'Complimentary welcome drinks',
      'Valet parking available',
    ],
  },
  marina: {
    about: [
      'Set along the waterfront at Marina Walk, this studio pairs relaxed coastal calm with the full Thalia service menu. It is a favourite for pre-event glam and unhurried self-care alike.',
      'Our Marina team specialises in luminous colour, blow-dry artistry and skin treatments designed for Dubai’s climate — so you leave glowing, whatever the forecast.',
    ],
    highlights: [
      'Waterfront views and natural light',
      'Express blow-dry bar',
      'Bridal and event styling',
      'Walk-ins welcome',
    ],
  },
  jbr: {
    about: [
      'Nestled in The Walk at Jumeirah Beach Residence, our JBR studio brings beachside ease to high-end beauty. Drop in after the promenade for nails, lashes or a fresh new look.',
      'The JBR team is known for flawless manicures, lash and brow work and radiant everyday makeup — quick, spotless and always finished to the last detail.',
    ],
    highlights: [
      'Dedicated nail and lash lounge',
      'Beachside promenade location',
      'Late evening appointments',
      'Family-friendly service',
    ],
  },
};

/** Fallback content for any salon without a curated entry above. */
export const DEFAULT_SALON_CONTENT = {
  about: [
    'A Thalia Beauty Studio location offering our full menu of hair, face, body and nail services in a calm, contemporary space.',
    'Our specialists tailor every visit to you — book online and enjoy the signature Thalia experience.',
  ],
  highlights: [
    'Full hair, face, body and nail menu',
    'Experienced specialists',
    'Online booking',
  ],
};
