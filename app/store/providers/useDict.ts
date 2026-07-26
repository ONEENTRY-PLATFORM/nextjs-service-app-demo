import type { IAttributeValues } from 'oneentry/dist/base/utils';
import { useContext } from 'react';

import { DictContext } from './DictContext';

/**
 * Read the `system_content` UI-text dictionary inside a client component.
 *
 * The client-side counterpart of the server's `ServerProvider('dict')`: returns
 * the dictionary supplied by `DictProvider` (an empty object when mounted
 * outside it). Use it exactly like the server dictionary — always with an
 * English fallback, since the dictionary is optional:
 *
 * ```tsx
 * const dict = useDict();
 * const label = (dict?.book_text?.value as string | undefined) || 'Book Online';
 * ```
 * @returns {IAttributeValues} The dictionary values keyed by marker
 */
export const useDict = (): IAttributeValues => useContext(DictContext);
