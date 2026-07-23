'use client';

import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX, ReactNode } from 'react';

import { DictContext } from './DictContext';

/**
 * DictProvider — makes the `system_content` dictionary available to every
 * client component below it via {@link DictContext} / {@link useDict}.
 *
 * Mounted once in the root layout with the dictionary the server already
 * fetched (`getDictionary()`), so the value is baked into the prerendered /
 * ISR payload and hydrated on the client — no per-component `dict` prop and no
 * extra request. Server components keep reading the dictionary directly through
 * `ServerProvider('dict')`; this only covers the client half of the tree.
 * @param   {object}           props          - Component properties
 * @param   {IAttributeValues} props.dict     - Dictionary from the server (`system_content` values)
 * @param   {ReactNode}        props.children - Subtree that can read the dictionary
 * @returns {JSX.Element}                     Provider wrapping the subtree
 */
export const DictProvider = ({
  dict,
  children,
}: {
  dict: IAttributeValues;
  children: ReactNode;
}): JSX.Element => {
  return <DictContext.Provider value={dict}>{children}</DictContext.Provider>;
};
