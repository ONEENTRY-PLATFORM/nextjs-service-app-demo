import type { JSX } from 'react';

/**
 * OfferStepDots — the two-bar step indicator of the modal header (mock's
 * `[1, 2].map` row): the current step is solid white, a passed one nearly so,
 * an upcoming one translucent.
 * @param   {object}      props      - Component properties
 * @param   {1 | 2}       props.step - Current wizard step
 * @returns {JSX.Element}            Step indicator row
 */
const OfferStepDots = ({ step }: { step: 1 | 2 }): JSX.Element => (
  <div className="mt-4 flex items-center gap-2">
    {([1, 2] as const).map((n) => (
      <div
        key={n}
        className="h-1 flex-1 rounded-full transition-all"
        style={{
          background:
            n === step
              ? 'rgba(255,255,255,1)'
              : n < step
                ? 'rgba(255,255,255,0.8)'
                : 'rgba(255,255,255,0.3)',
        }}
      />
    ))}
  </div>
);

export default OfferStepDots;
