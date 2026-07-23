'use client';

import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';

/**
 * TermsConsent — the required "I agree to the Terms & Privacy Policy" checkbox
 * of the sign-up form, as in the mock.
 * @param   {object}                     props          - Component properties
 * @param   {boolean}                    props.checked  - Whether consent is given
 * @param   {(checked: boolean) => void} props.onChange - Toggle consent
 * @returns {JSX.Element}                               Consent checkbox row
 */
const TermsConsent = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}): JSX.Element => {
  /** UI-text dictionary for the localized consent labels */
  const dict = useDict();

  return (
    <label className="flex cursor-pointer items-start gap-2.5 select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 cursor-pointer rounded accent-fuchsia-500"
      />
      <span className="text-sm leading-relaxed text-neutral-300">
        {(dict?.terms_agree_prefix?.value as string | undefined) ||
          'I agree to the'}{' '}
        <span className="font-semibold text-fuchsia-500 underline">
          {(dict?.terms_text?.value as string | undefined) || 'Terms'}
        </span>
        {' & '}
        <span className="font-semibold text-fuchsia-500 underline">
          {(dict?.privacy_policy_text?.value as string | undefined) ||
            'Privacy Policy'}
        </span>
      </span>
    </label>
  );
};

export default TermsConsent;
