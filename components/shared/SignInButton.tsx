'use client';

import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX } from 'react';
import { useContext } from 'react';

import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';

/**
 * Sign in button component
 *
 * This component renders a button that opens the sign in form in a drawer.
 * When clicked, it sets the drawer to open and specifies the SignInForm component
 * to be displayed in the drawer.
 * @param   {object}           props      - Component properties
 * @param   {IAttributeValues} props.dict - Dictionary object containing localized text values
 * @returns {JSX.Element}                 Sign in button
 */
const SignInButton = ({ dict }: { dict: IAttributeValues }): JSX.Element => {
  /** These functions control the state of the drawer and which component is displayed */
  const { setOpen, setComponent } = useContext(OpenDrawerContext);

  /** This allows the button text to be displayed in the user's preferred language */
  const { log_in_text } = dict;

  return (
    <button
      onClick={() => {
        setOpen(true);
        setComponent('SignInForm');
      }}
      type="button"
      className="mx-auto w-auto items-center justify-center rounded-card border border-solid border-fuchsia-500 bg-transparent px-3.5 py-1 text-base font-bold tracking-wide text-fuchsia-500 uppercase transition-colors duration-300 hover:border-fuchsia-600 hover:text-fuchsia-600 focus-visible:text-fuchsia-600 focus-visible:outline-fuchsia-600 disabled:border-neutral-300 disabled:bg-neutral-300/50 disabled:text-neutral-300"
    >
      {log_in_text?.value as string | undefined}
    </button>
  );
};

export default SignInButton;
