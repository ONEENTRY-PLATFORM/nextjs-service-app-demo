import { CurrencyEnum, IntlEnum } from '@/app/types/enum';

/**
 * Format a price with currency symbol based on locale.
 *
 * This function formats a numeric amount into a localized currency string
 * using the Intl.NumberFormat API. It uses the English locale and currency
 * settings from the application's enum configurations.
 * @param   {object}          props        - The properties object
 * @param   {number | string} props.amount - The amount to format as a number or string
 * @returns {string}                       Formatted price string with currency symbol
 * @example
 * ```typescript
 * const price = UsePrice({ amount: 99.99 });
 * console.log(price); // "$99.99" (depending on locale settings)
 * ```
 */
export const UsePrice = ({ amount }: { amount: number | string }): string => {
  const currency = CurrencyEnum['en' as keyof typeof CurrencyEnum];
  const intlEnum = IntlEnum['en' as keyof typeof IntlEnum];
  const formattedPrice = new Intl.NumberFormat(intlEnum, {
    style: 'currency',
    currency: currency,
  }).format(Number(amount));

  return formattedPrice;
};
