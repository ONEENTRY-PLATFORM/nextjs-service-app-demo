import { MapPin } from 'lucide-react';
import Link from 'next/link';
import type { JSX } from 'react';

/**
 * SalonChip component — a single salon the specialist works at.
 *
 * A bordered rounded chip showing the salon title (bold DARK) and, when
 * available, its address (MUTED) preceded by a map-pin glyph. The border tints
 * to a translucent PINK and the chip gains a soft shadow on hover. When the
 * salon page is known the chip is a link to it;
 * otherwise it renders as a plain block.
 * @param   {object}             props         - Component properties.
 * @param   {string}             props.title   - Salon title.
 * @param   {string | undefined} props.address - Optional salon street address.
 * @param   {string | undefined} props.href    - Optional link to the salon page.
 * @returns {JSX.Element}                      JSX.Element representing the salon chip.
 */
const SalonChip = ({
  title,
  address,
  href,
}: {
  title: string;
  address?: string | undefined;
  href?: string | undefined;
}): JSX.Element => {
  /** Shared chip markup for both the linked and the static variant */
  const content = (
    <>
      <MapPin size={16} color="#a8a9b5" className="shrink-0" />
      <span className="min-w-0">
        <span className="block text-base leading-tight font-bold text-slate-400">
          {title}
        </span>
        {address ? (
          <span className="mt-0.5 block text-base leading-tight text-neutral-300">
            {address}
          </span>
        ) : null}
      </span>
    </>
  );

  const chipClass =
    'flex items-center gap-2.5 rounded-2xl border-[1.5px] border-slate-150 px-4 py-2.5 text-left transition-all hover:border-fuchsia-500/33';

  if (href) {
    return (
      <Link
        prefetch={false}
        href={href}
        data-testid="master-salon-chip"
        className={`${chipClass} hover:shadow-md`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div data-testid="master-salon-chip" className={chipClass}>
      {content}
    </div>
  );
};

export default SalonChip;
