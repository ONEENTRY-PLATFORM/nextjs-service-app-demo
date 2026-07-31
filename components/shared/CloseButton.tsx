'use client';

import { X } from 'lucide-react';
import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';
import { dictText } from '@/components/utils/dictText';

/**
 * Shell classes and icon size per surface the button sits on. A tone names a
 * look the mock already uses, it does not invent one:
 * - `accent` — gradient modal headers (auth forms, review, offer booking);
 * - `overlay` — fullscreen dark viewers (gallery / portfolio / salon lightbox);
 * - `ring` — a light panel where the button needs a visible hit area;
 * - `plain` — inline next to an input, no ring at all.
 *
 * Every tone draws the same lucide `X`; only the frame around it differs, so a
 * cross never looks heavier in one popup than in another.
 */
const TONES = {
  accent: {
    className:
      'size-9 shrink-0 rounded-full border-2 border-white/70 text-white transition-opacity hover:opacity-80',
    size: 16,
  },
  overlay: {
    className:
      'size-10 shrink-0 rounded-full border-[1.5px] border-white/25 text-white transition-colors hover:bg-white/10',
    size: 17,
  },
  ring: {
    className:
      'size-12 shrink-0 rounded-full border border-slate-150 text-slate-400 transition-colors hover:bg-slate-50',
    size: 18,
  },
  plain: {
    className:
      'rounded-lg p-1.5 text-neutral-300 transition-colors hover:bg-gray-100',
    size: 18,
  },
} as const;

/**
 * CloseButton — the one × used to dismiss popups, modals and viewers.
 *
 * Positioning stays with the caller (`className`), because the same button is
 * pinned to a corner in one place and sits in a flex header in another.
 * @param   {object}      props             - Component properties
 * @param   {() => void}  props.onClose     - Dismiss the surface this button belongs to
 * @param   {string}      [props.tone]      - Surface preset: `accent` (default), `overlay`, `ring` or `plain`
 * @param   {number}      [props.size]      - Icon size in px, overriding the tone default
 * @param   {string}      [props.className] - Positioning / layout classes
 * @param   {string}      [props.label]     - `aria-label`, defaults to the dictionary "Close"
 * @param   {string}      [props.testId]    - `data-testid` for e2e tests
 * @returns {JSX.Element}                   Close button
 */
const CloseButton = ({
  onClose,
  tone = 'accent',
  size,
  className,
  label,
  testId,
}: {
  onClose: () => void;
  tone?: keyof typeof TONES | undefined;
  size?: number | undefined;
  className?: string | undefined;
  label?: string | undefined;
  testId?: string | undefined;
}): JSX.Element => {
  /** UI-text dictionary for the localized default aria-label */
  const dict = useDict();
  const preset = TONES[tone];

  return (
    <button
      type="button"
      onClick={onClose}
      aria-label={label ?? dictText(dict, 'close_text', 'Close')}
      data-testid={testId}
      className={`flex cursor-pointer items-center justify-center ${preset.className}${
        className ? ` ${className}` : ''
      }`}
    >
      <X size={size ?? preset.size} />
    </button>
  );
};

export default CloseButton;
