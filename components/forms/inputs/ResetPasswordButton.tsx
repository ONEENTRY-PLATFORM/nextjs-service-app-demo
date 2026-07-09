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
  const { setOpen, setComponent } = useContext(OpenDrawerContext);

  /** Render reset password button with click handler to open drawer */
  return (
    <button
      onClick={() => {
        setOpen(true);
        setComponent('ForgotPasswordForm');
      }}
      type="button"
      className="w-auto text-lg font-bold text-cyan-400 underline"
    >
      {title}
    </button>
  );
};

export default ResetPasswordButton;
