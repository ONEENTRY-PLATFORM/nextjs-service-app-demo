import { ChevronDown } from 'lucide-react';
import type { JSX } from 'react';

import FormFieldAnimations from '@/components/forms/animations/FormFieldAnimations';

/**
 * ProfileFieldRow — one read-only profile row of the account card. The chevron is
 * decorative — editing is entered through the card's Edit button.
 * @param   {object}      props       - Component props
 * @param   {string}      props.label - Field label from the CMS
 * @param   {string}      props.value - Current value, empty when the user never filled it in
 * @param   {number}      props.index - Position for the animation stagger
 * @returns {JSX.Element}             Read-only profile row
 */
const ProfileFieldRow = ({
  label,
  value,
  index,
}: {
  label: string;
  value: string;
  index: number;
}): JSX.Element => {
  return (
    <FormFieldAnimations
      index={index}
      className="border-b border-slate-240 py-3"
    >
      <p className="mb-1 text-base text-neutral-300">{label}</p>
      <div className="flex items-center justify-between gap-2">
        <p className="text-base font-semibold text-slate-400">{value || '—'}</p>
        <ChevronDown
          size={14}
          className="shrink-0 text-accent-cyan"
          aria-hidden="true"
        />
      </div>
    </FormFieldAnimations>
  );
};

export default ProfileFieldRow;
