'use client';

import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';
import { dictText } from '@/components/utils/dictText';

/**
 * "or continue with" hairline divider between the credential form and the
 * social (Google) sign-in button: two thin rules with muted centered text.
 * kept because Google OAuth is wired through the CMS auth providers.
 * @param   {object}      props      - Component props
 * @param   {string}      props.text - Divider label; falls back to the CMS dictionary, then "or continue with"
 * @returns {JSX.Element}            The divider row
 */
const AuthDivider = ({ text }: { text?: string }): JSX.Element => {
  /** UI-text dictionary for the localized divider label */
  const dict = useDict();
  const label =
    text ?? dictText(dict, 'or_continue_with_text', 'or continue with');

  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-slate-150" />
      <span className="text-sm text-neutral-300">{label}</span>
      <span className="h-px flex-1 bg-slate-150" />
    </div>
  );
};

export default AuthDivider;
