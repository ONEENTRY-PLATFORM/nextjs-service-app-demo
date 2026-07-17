import type { CSSProperties, JSX } from 'react';

import Dirham from './Dirham';

/** Currency the {@link Dirham} glyph stands for. */
const AED = 'AED';

/**
 * Currency marker for a price, driven by the CMS `currency` attribute.
 *
 * Prices used to hardcode the dirham glyph, which silently assumed the salon
 * only ever charges in AED. The products carry a `currency` attribute (flagged
 * `isCurrency` in their attribute set), so render from it instead: `AED` keeps
 * the designed glyph, anything else falls back to the code itself.
 *
 * An empty `currency` also renders the glyph — the CMS is the source of truth
 * but the project is AED-only today, and a bare number reads worse than a
 * possibly-wrong symbol.
 * @param   {object}        props             - Component properties
 * @param   {string}        [props.currency]  - Currency code from the CMS (e.g. `'AED'`)
 * @param   {boolean}       [props.big]       - Larger price context — see {@link Dirham}
 * @param   {string}        [props.className] - CSS classes for the glyph
 * @param   {CSSProperties} [props.style]     - Inline styles for the glyph
 * @returns {JSX.Element}                     Dirham glyph for AED, otherwise the currency code
 */
const CurrencySymbol = ({
  currency,
  big = false,
  className = '',
  style,
}: {
  currency?: string | undefined;
  big?: boolean;
  className?: string;
  style?: CSSProperties;
}): JSX.Element => {
  if (currency && currency.toUpperCase() !== AED) {
    return (
      <span className={className} style={{ marginRight: '0.28em', ...style }}>
        {currency}
      </span>
    );
  }

  const props = {
    big,
    className,
    ...(style ? { style } : {}),
  };
  return <Dirham {...props} />;
};

export default CurrencySymbol;
