import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { IAttributeValues } from 'oneentry/types';
import type { JSX } from 'react';

import { ServerProvider } from '@/app/store/providers/ServerProvider';
import { dictText } from '@/components/utils/dictText';

/**
 * BackLink component — a link back to the specialists listing.
 *
 * Rendered on the site container rails above the master profile card, it
 * mirrors the reference design: an arrow glyph followed by "Back to
 * Specialist" (mock wording, singular) in the brand DARK tone
 * (`slate-400` = #4c4d56) that fades on hover.
 * @returns {JSX.Element} JSX.Element representing the back link.
 */
const BackLink = (): JSX.Element => {
  const [dict] = ServerProvider<IAttributeValues>('dict');

  return (
    <Link
      href="/masters"
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 transition-opacity hover:opacity-70"
    >
      <ArrowLeft size={16} />{' '}
      {dictText(dict, 'back_to_specialist_text', 'Back to Specialist')}
    </Link>
  );
};

export default BackLink;
