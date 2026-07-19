import type { JSX } from 'react';

/**
 * "or continue with" hairline divider between the credential form and the
 * social (Google) sign-in button. Mirrors the static-html reference: two thin
 * rules with muted centered text.
 * @param   {object}      props      - Component props
 * @param   {string}      props.text - Divider label (default "or continue with")
 * @returns {JSX.Element}            The divider row
 */
const AuthDivider = ({
  text = 'or continue with',
}: {
  text?: string;
}): JSX.Element => {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-slate-150" />
      <span className="text-sm text-neutral-300">{text}</span>
      <span className="h-px flex-1 bg-slate-150" />
    </div>
  );
};

export default AuthDivider;
