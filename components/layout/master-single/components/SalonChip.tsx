import { MapPin } from 'lucide-react';
import type { JSX } from 'react';

/**
 * SalonChip component — a single salon the specialist works at.
 *
 * A bordered rounded chip showing the salon title (bold DARK) and, when
 * available, its address (MUTED) preceded by a map-pin glyph. The border tints
 * to a translucent PINK on hover. When no address is supplied only the title
 * is rendered.
 * @param   {object}             props         - Component properties.
 * @param   {string}             props.title   - Salon title.
 * @param   {string | undefined} props.address - Optional salon street address.
 * @returns {JSX.Element}                      JSX.Element representing the salon chip.
 */
const SalonChip = ({
  title,
  address,
}: {
  title: string;
  address?: string | undefined;
}): JSX.Element => {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border-[1.5px] border-slate-150 px-4 py-2.5 transition-colors hover:border-fuchsia-500/33">
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
    </div>
  );
};

export default SalonChip;
