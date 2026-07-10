import type { IAttributes } from 'oneentry/dist/base/utils';
import type { IMenusPages } from 'oneentry/dist/menus/menusInterfaces';

import { CurrencyEnum, IntlEnum } from '@/app/types/enum';

/**
 * Extract form attributes (fields) from a OneEntry form entity as an array.
 *
 * The Forms API returns `attributes` either as an array of fields or as a
 * plain object — in particular an empty `{}` when the form has no fields
 * configured in the admin panel. This helper normalizes both shapes so
 * consumers can safely call array methods (`sort`, `map`, `filter`).
 * @param   {object | undefined} form - Form entity from the OneEntry Forms API (or undefined while loading)
 * @returns {Array}                   Shallow copy of the attributes array, or an empty array
 * @example
 * ```typescript
 * const fields = getFormAttributes(data).sort((a, b) => a.position - b.position);
 * ```
 */
export const getFormAttributes = <T = IAttributes>(
  form: { attributes?: unknown } | undefined,
): T[] => {
  const attributes = form?.attributes;
  return Array.isArray(attributes) ? ([...attributes] as T[]) : [];
};

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

/**
 * Format a date based on locale.
 *
 * This function formats a date into a localized string format using the
 * Intl.DateTimeFormat API. The default format is day-month-year with
 * the month displayed as a short name (e.g., "01-Jan-2023").
 * @param   {object}                 props          - The properties object
 * @param   {number | string | Date} props.fullDate - The date to format as a number, string, or Date object
 * @param   {string}                 props.format   - The locale format to use (default: 'en')
 * @returns {string}                                Formatted date string in day-month-year format
 * @example
 * ```typescript
 * const date = UseDate({ fullDate: new Date(), format: 'en' });
 * console.log(date); // "01-Jan-2023"
 * ```
 */
export const UseDate = ({
  fullDate,
  format = 'en',
}: {
  fullDate: number | string | Date;
  format: string;
}): string => {
  const d = new Date(fullDate);
  const year = new Intl.DateTimeFormat(format, {
    year: 'numeric',
  }).format(d);
  const month = new Intl.DateTimeFormat(format, {
    month: 'short',
  }).format(d);
  const day = new Intl.DateTimeFormat(format, {
    day: '2-digit',
  }).format(d);

  const date = day + '-' + month + '-' + year;

  return date;
};

/**
 * Format a raw UAE phone number for display.
 *
 * The CMS stores salon phones as a compact string (e.g. `+97147012200`);
 * the design shows them spaced by group. This normalizes to digits, strips
 * the `971` country code (or a local leading `0`), then regroups: landline
 * as `+971 A BBB CCCC` (8 national digits) and mobile as `+971 5X XXX XXXX`
 * (9 national digits, `5`-prefixed). Any unrecognized shape is returned
 * trimmed and unchanged, and empty input yields an empty string.
 * @param   {string | undefined | null} raw - Raw phone string from the `salon_phone` attribute
 * @returns {string}                         Human-readable phone, or `''` when input is empty
 * @example
 * ```typescript
 * formatUaePhone('+97147012200');  // "+971 4 701 2200"
 * formatUaePhone('+971501234567'); // "+971 50 123 4567"
 * ```
 */
export const formatUaePhone = (raw: string | undefined | null): string => {
  if (!raw) return '';
  const trimmed = raw.trim();
  let national = trimmed.replace(/\D/g, '');
  if (national.startsWith('971')) national = national.slice(3);
  else if (national.startsWith('0')) national = national.slice(1);
  if (national.length === 9 && national.startsWith('5')) {
    return `+971 ${national.slice(0, 2)} ${national.slice(2, 5)} ${national.slice(5)}`;
  }
  if (national.length === 8) {
    return `+971 ${national.slice(0, 1)} ${national.slice(1, 4)} ${national.slice(4)}`;
  }
  return trimmed;
};

/**
 * Sort an array by position property.
 *
 * This function sorts an array of objects based on their position property
 * in ascending order. Objects without a position property are sorted to the end.
 * @param   {Array<{ position: number }>} array - Array of objects to sort, each should have a position property
 * @returns {Array<{ position: number }>}       New sorted array based on position values
 * @example
 * ```typescript
 * const items = [
 *   { name: 'Item 1', position: 3 },
 *   { name: 'Item 2', position: 1 },
 *   { name: 'Item 3', position: 2 }
 * ];
 * const sorted = sortArrayByPosition(items);
 * // Result: [{ name: 'Item 2', position: 1 }, { name: 'Item 3', position: 2 }, { name: 'Item 1', position: 3 }]
 * ```
 */

export const sortArrayByPosition = <T extends { position: number }>(
  array: T[],
): T[] => {
  return array.sort((a, b) => a.position - b.position);
};

/**
 * Sort object fields by position property.
 *
 * This function sorts the fields of an object based on their position property
 * and returns a new object with the fields in the sorted order.
 * @param obj - Object with fields to sort, each field should have a position property
 * @returns   New object with fields sorted by position values
 * @example
 * ```typescript
 * const obj = {
 *   field1: { name: 'Field 1', position: 3 },
 *   field2: { name: 'Field 2', position: 1 },
 *   field3: { name: 'Field 3', position: 2 }
 * };
 * const sorted = sortObjectFieldsByPosition(obj);
 * // Result: { field2: { name: 'Field 2', position: 1 }, field3: { name: 'Field 3', position: 2 }, field1: { name: 'Field 1', position: 3 } }
 * ```
 */

export const sortObjectFieldsByPosition = <T extends { position: number }>(
  obj: Record<string, T>,
): Record<string, T> => {
  const entries = Object.entries(obj);
  entries.sort((a, b) => a[1].position - b[1].position);
  const sortedObj: Record<string, T> = {};
  for (const [key, value] of entries) {
    sortedObj[key] = value;
  }
  return sortedObj;
};

/**
 * Convert a flat menu structure to a nested structure based on parent-child relationships.
 *
 * This function takes a flat array of menu items and converts it into a hierarchical
 * nested structure based on the parentId property of each item. Items with a parentId
 * of null are considered root level items.
 * @param   {[] | Array<IMenusPages>} data - Array of menu pages from OneEntry CMS
 * @param   {number | null}           pid  - Parent ID to match against (null for root items)
 * @returns {IMenusPages[]}                Nested menu structure with children arrays
 * @example
 * ```typescript
 * const flatMenu = [
 *   { id: 1, parentId: null, title: 'Home' },
 *   { id: 2, parentId: null, title: 'Services' },
 *   { id: 3, parentId: 2, title: 'Haircut' },
 *   { id: 4, parentId: 2, title: 'Coloring' }
 * ];
 * const nestedMenu = flatMenuToNested(flatMenu, null);
 * // Result: [
 * //   { id: 1, parentId: null, title: 'Home', children: [] },
 * //   { id: 2, parentId: null, title: 'Services', children: [
 * //     { id: 3, parentId: 2, title: 'Haircut', children: [] },
 * //     { id: 4, parentId: 2, title: 'Coloring', children: [] }
 * //   ]}
 * // ]
 * ```
 */
export const flatMenuToNested = (
  data: [] | Array<IMenusPages>,
  pid: number | null,
): IMenusPages[] => {
  return data.reduce((r: IMenusPages[], element: IMenusPages) => {
    if (pid == element.parentId) {
      const object = { ...element };
      const children = flatMenuToNested(data, element.id);
      if (children.length) {
        object.children = children;
      } else {
        // The API returns `children: []` on every page — drop the empty array
        // so consumers can rely on `children` meaning "has a submenu".
        delete object.children;
      }
      r.push(object);
    }
    return r;
  }, []);
};

/**
 * Shuffle an array randomly.
 *
 * This function takes an array and returns a new array with the elements
 * in a random order. It uses the Fisher-Yates shuffle algorithm approach
 * by mapping each element to a random sort key, sorting by that key,
 * and then extracting the original values.
 * @param   {Array} array - Array to shuffle
 * @returns {Array}       New array with elements in random order
 */

export const shuffleArray = <T>(array: T[]): T[] => {
  return array
    .map((a) => ({ sort: Math.random(), value: a }))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value);
};
