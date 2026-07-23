import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX } from 'react';

import { ServerProvider } from '@/app/store/providers/ServerProvider';

/**
 * GalleryUnavailable — the gallery error state shown when the OneEntry gallery
 * returns no photos (an empty gallery tree or a failed CMS read). Replaces the
 * interactive grid with a plain notice so the route degrades to an error text
 * instead of an empty filter UI or a 404.
 * @returns {JSX.Element} Centered gallery-unavailable notice
 */
const GalleryUnavailable = (): JSX.Element => {
  const [dict] = ServerProvider<IAttributeValues>('dict');
  return (
    <div data-testid="gallery-unavailable" className="px-4 py-24 text-center">
      <p className="text-base font-semibold text-slate-400">
        {(dict?.gallery_unavailable_text?.value as string | undefined) ||
          'The gallery is currently unavailable.'}
      </p>
      <p className="mt-2 text-sm text-neutral-300">
        {(dict?.try_again_later_text?.value as string | undefined) ||
          'Please try again later.'}
      </p>
    </div>
  );
};

export default GalleryUnavailable;
