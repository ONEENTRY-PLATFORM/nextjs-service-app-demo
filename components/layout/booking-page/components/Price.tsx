import type { JSX } from 'react';

import CurrencySymbol from '@/components/shared/CurrencySymbol';

/**
 * Price — the amount with its currency marker, `null`-safe: while the CMS
 * product has no price the whole node collapses instead of rendering a bare
 * symbol.
 * @param   {object}             props            - Component properties
 * @param   {number | null}      props.amount     - Price, or `null` when the CMS has none
 * @param   {string}             [props.currency] - Currency code from the CMS (`'AED'` renders the dirham glyph)
 * @param   {boolean}            [props.big]      - Larger price context (smaller symbol)
 * @returns {JSX.Element | null}                  Price node or `null`
 */
const Price = ({
  amount,
  currency,
  big,
}: {
  amount: number | null;
  currency?: string | undefined;
  big?: boolean | undefined;
}): JSX.Element | null => {
  if (amount === null) {
    return null;
  }
  return (
    <>
      <CurrencySymbol currency={currency} big={Boolean(big)} />
      {amount}
    </>
  );
};

export default Price;
