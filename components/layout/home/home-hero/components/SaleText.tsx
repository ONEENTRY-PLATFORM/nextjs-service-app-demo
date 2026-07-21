import type { JSX } from 'react';

/**
 * Sale badge text with every "%" character wrapped in a span so the symbol
 * can be styled separately from the digits.
 * @param   {object}      props               - Component properties
 * @param   {string}      props.text          - Sale text from the CMS slide (e.g. "-30%")
 * @param   {string}      [props.percentSize] - Font size of the "%" symbol as an em ratio
 * @returns {JSX.Element}                     JSX.Element with percent signs wrapped in spans
 */
const SaleText = ({
  text,
  percentSize = '0.512em',
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
