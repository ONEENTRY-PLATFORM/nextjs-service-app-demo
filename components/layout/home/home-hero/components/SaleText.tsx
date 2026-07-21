import type { JSX } from 'react';

/**
 * Sale badge text with every "%" character wrapped in a span so the symbol
 * can be styled separately from the digits. The symbol size is an em ratio so
 * it follows the badge typography instead of being restated: the desktop badge
 * runs 150.22px against the digits' 162.99px (≈0.922em), the mobile badge
 * 45.04px against 87.96px (≈0.51em) — hence the overridable `percentSize`.
 * @param   {object}      props               - Component properties
 * @param   {string}      props.text          - Sale text from the CMS slide (e.g. "-30%")
 * @param   {string}      [props.percentSize] - Font size of the "%" symbol as an em ratio
 * @returns {JSX.Element}                     JSX.Element with percent signs wrapped in spans
 */
const SaleText = ({
  text,
  percentSize = '0.922em',
}: {
  text: string;
  percentSize?: string | undefined;
}): JSX.Element => (
  <>
    {text.split(/(%)/).map((part, i) =>
      part === '%' ? (
        <span key={i} style={{ fontSize: percentSize }}>
          %
        </span>
      ) : (
        part
      ),
    )}
  </>
);

export default SaleText;
