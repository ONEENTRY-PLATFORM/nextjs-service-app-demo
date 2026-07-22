import type { CSSProperties } from 'react';

import { PINK } from './constants';

/** Resting border of an unselected card (mock's neutral hairline). */
const IDLE_BORDER = '#e8e8f0';

/**
 * selectableCardStyle — border and shadow of a selectable booking card.
 *
 * The two specialist cards each render a mobile and a desktop body, and all four
 * carried this object byte-for-byte. It stays inline rather than becoming a
 * Tailwind class because the selected state interpolates the brand colour into
 * two rgba shadows, which arbitrary classes cannot express.
 * @param   {boolean}       active - Whether the card is the current selection
 * @returns {CSSProperties}        Style object for the card element
 */
export const selectableCardStyle = (active: boolean): CSSProperties => ({
  borderColor: active ? PINK : IDLE_BORDER,
  boxShadow: active
    ? `0 0 0 3px ${PINK}22, 0 8px 24px ${PINK}22`
    : '0 2px 12px rgba(0,0,0,0.06)',
});
