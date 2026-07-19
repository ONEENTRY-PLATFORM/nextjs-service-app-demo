'use client';

import type { JSX } from 'react';
import { useContext } from 'react';

import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';

/**
 * Reset password button.
 * @param   {object}      props       - Reset password button props.
 * @param   {string}      props.title - button title.
 * @returns {JSX.Element}             Reset password button.
 */
const ResetPasswordButton = ({ title }: { title: string }): JSX.Element => {
  /** Access drawer context to control open state and component display */
  const { setOpen, setComponent, setDirection } = useContext(OpenDrawerContext);

  /** Render reset password button with click handler to open drawer */
  return (
    <button
      onClick={() => {
        /** Sign In → Reset is a forward step: slide in from the right. */
        setDirection('forward');
        setOpen(true);
        setComponent('ForgotPasswordForm');
      }}
      type="button"
      data-testid="auth-reset-password"
      className="w-auto text-sm font-semibold text-accent-cyan underline"
    >
      {title}
    </button>
  );
};

export default ResetPasswordButton;
