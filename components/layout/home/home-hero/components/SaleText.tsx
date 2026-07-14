import type { JSX } from 'react';

/**
 * Sale badge text with every "%" character wrapped in a span so the symbol
 * can be styled separately from the digits (rendered slightly smaller via
 * em-based size, so it scales with the badge typography).
 * @param   {object}      props      - Component properties
 * @param   {string}      props.text - Sale text from the CMS slide (e.g. "-30%")
 * @returns {JSX.Element}            JSX.Element with percent signs wrapped in spans
 */
const SaleText = ({ text }: { text: string }): JSX.Element => (
  <>
    {text.split(/(%)/).map((part, i) =>
      part === '%' ? (
        <span key={i} className="text-[60px]">
          %
        </span>
      ) : (
        part
      ),
    )}
  </>
);

export default SaleText;
