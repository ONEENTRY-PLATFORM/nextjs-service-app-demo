'use client';

import type { JSX } from 'react';
import { useContext } from 'react';

import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';

/**
 * Create account button.
 * @param   {object}      props       - Component properties.
 * @param   {string}      props.title - Button title.
 * @returns {JSX.Element}             Create account button.
 */
const CreateAccountButton = ({ title }: { title: string }): JSX.Element => {
  /** Access drawer context to control open state and component display */
  const { setOpen, setComponent, setDirection } = useContext(OpenDrawerContext);

  /** Render create account button with click handler to open drawer */
  return (
    <button
      onClick={() => {
        /** Sign In → Sign Up is a forward step: slide in from the right. */
        setDirection('forward');
        setOpen(true);
        setComponent('SignUpForm');
      }}
      type="button"
      data-testid="auth-create-account"
      className="w-full rounded-xl border-2 border-solid border-fuchsia-500 bg-white px-10 py-3.5 text-base font-bold tracking-widest text-fuchsia-500 uppercase transition-transform duration-150 hover:scale-102 focus-visible:outline-fuchsia-600 active:scale-97 disabled:border-neutral-300 disabled:text-neutral-300 max-sm:px-5"
    >
      {title}
    </button>
  );
};

export default CreateAccountButton;
