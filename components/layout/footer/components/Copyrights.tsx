import type { IAttributeValues } from 'oneentry/types';
import type { JSX } from 'react';

import { dictText } from '@/components/utils/dictText';

/**
 * Copyrights component
 *
 * The line comes from the `footer_copyright_text` dictionary marker, where the
 * year is the `%year%` placeholder — the dictionary rejects `{}` braces, and a
 * hardcoded year silently goes stale every January. It is substituted at render
 * time, so an ISR revalidation carries the new year on its own.
 * @param   {object}           props      - Component properties
 * @param   {IAttributeValues} props.dict - Dictionary object containing localized text values from OneEntry CMS
 * @returns {JSX.Element}                 JSX.Element
 */
const Copyrights = ({ dict }: { dict: IAttributeValues }): JSX.Element => {
  const line = dictText(
    dict,
    'footer_copyright_text',
    '@ %year% Thalia Beauty Studio',
  ).replace('%year%', String(new Date().getFullYear()));

  return <span className="leading-5">{line}</span>;
};

export default Copyrights;
