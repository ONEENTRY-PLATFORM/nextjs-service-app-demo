import type { JSX } from 'react';

import Dirham from '@/components/shared/Dirham';

/**
 * Price — a dirham symbol with the amount, `null`-safe: while the CMS product
 * has no price the whole node collapses instead of rendering a bare symbol.
 * @param   {object}             props        - Component properties
 * @param   {number | null}      props.amount - Price in AED or `null`
 * @param   {boolean}            [props.big]  - Larger price context (smaller symbol)
 * @returns {JSX.Element | null}              Price node or `null`
 */
const Price = ({
  amount,
  big,
}: {
  amount: number | null;
  big?: boolean | undefined;
}): JSX.Element | null => {
  if (amount === null) {
    return null;
  }
  return (
    <>
      <Dirham big={Boolean(big)} />
      {amount}
    </>
  );
};

export default Price;
