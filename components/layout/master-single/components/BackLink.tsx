import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { JSX } from 'react';

/**
 * BackLink component — a link back to the specialists listing.
 *
 * Rendered on the site container rails above the master profile card, it
 * mirrors the reference design: an arrow glyph followed by "Back to
 * Specialists" in the brand DARK tone (`slate-400` = #4c4d56) that fades on
 * hover.
 * @returns {JSX.Element} JSX.Element representing the back link.
 */
const BackLink = (): JSX.Element => {
  return (
    <Link
      href="/masters"
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 transition-opacity hover:opacity-70"
    >
      <ArrowLeft size={16} /> Back to Specialists
    </Link>
  );
};

export default BackLink;
