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
  const { setOpen, setComponent } = useContext(OpenDrawerContext);

  /** Render create account button with click handler to open drawer */
  return (
    <button
      onClick={() => {
        setOpen(true);
        setComponent('SignUpForm');
      }}
      type="button"
      className="w-full items-center justify-center rounded-card border border-solid border-fuchsia-500 bg-transparent px-10 py-4 text-xl font-bold tracking-wide text-fuchsia-500 uppercase transition-colors duration-300 hover:border-fuchsia-600 hover:text-fuchsia-600 focus-visible:text-fuchsia-600 focus-visible:outline-fuchsia-600 disabled:border-neutral-300 disabled:text-neutral-300 max-sm:px-5"
    >
      {title}
    </button>
  );
};

export default CreateAccountButton;
