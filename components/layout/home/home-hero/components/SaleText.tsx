import type { JSX } from 'react';

/**
 * Sale badge text with every "%" character wrapped in a span so the symbol
 * can be styled separately from the digits. Per the Figma spec the symbol is
 * 150.22px against the digits' 162.99px, expressed here as an em ratio so it
 * follows the badge typography across breakpoints instead of being restated.
 * @param   {object}      props      - Component properties
 * @param   {string}      props.text - Sale text from the CMS slide (e.g. "-30%")
 * @returns {JSX.Element}            JSX.Element with percent signs wrapped in spans
 */
const SaleText = ({ text }: { text: string }): JSX.Element => (
  <>
    {text.split(/(%)/).map((part, i) =>
      part === '%' ? (
        <span key={i} className="text-[0.922em]">
          %
        </span>
      ) : (
        part
      ),
    )}
  </>
);

export default SaleText;
