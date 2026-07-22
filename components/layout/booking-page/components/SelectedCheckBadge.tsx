import { Check } from 'lucide-react';
import type { JSX } from 'react';

import { PINK } from '../constants';

/**
 * SelectedCheckBadge — the pink tick marking the chosen specialist card.
 *
 * Both specialist cards render a mobile and a desktop body, and the badge was
 * identical in all four: a small ring-cut disc pinned to the portrait on mobile,
 * a larger glowing disc in the card corner on desktop. The two shapes differ
 * enough to keep as explicit variants rather than a pile of props.
 *
 * It stays absolutely positioned relative to whatever container the card places
 * it in — on both breakpoints that is the portrait wrapper, so the badge is NOT
 * something a card shell could own.
 * @param   {object}      props         - Component props
 * @param   {string}      props.variant - `mobile` (on the portrait) or `desktop` (card corner)
 * @returns {JSX.Element}               The badge
 */
const SelectedCheckBadge = ({
  variant,
}: {
  variant: 'mobile' | 'desktop';
}): JSX.Element =>
  variant === 'mobile' ? (
    <div
      className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full border-2 border-white"
      style={{ background: PINK }}
    >
      <Check size={17} color="#fff" />
    </div>
  ) : (
    <div
      className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full"
      style={{ background: PINK, boxShadow: `0 0 12px ${PINK}` }}
    >
      <Check size={16} color="#fff" />
    </div>
  );

export default SelectedCheckBadge;
