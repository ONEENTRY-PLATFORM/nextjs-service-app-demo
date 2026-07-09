'use client';

import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX } from 'react';
import { useContext } from 'react';

import { AuthContext } from '@/app/store/providers/AuthContext';
import { SignInForm } from '@/components/forms';

import DropdownAnimations from './animations/DropdownAnimations';
import DropdownButton from './DropdownButton';

/**
 * SignIn Component.
 * @param   {object}           props      - Props for the SignIn component.
 * @param   {IAttributeValues} props.dict - dictionary from server api.
 * @returns {JSX.Element}                 JSX.Element.
 */
const SignIn = ({ dict }: { dict: IAttributeValues }): JSX.Element => {
  const tabKey = 'signin';
  /** Safely extract text value with nullish coalescing operator */
  const signText = (dict.sign_text?.value as string | undefined) ?? 'Sign In';

  /** Access authentication status from context */
  const { isAuth } = useContext(AuthContext);

  /** If the user is authenticated, do not render the component */
  if (isAuth) return <></>;

  /** Render sign in dropdown with animations, button and form */
  return (
    <DropdownAnimations
      className="mb-4 flex w-full flex-col items-center"
      id={tabKey}
      index={5}
      tabKey={tabKey}
    >
      {/** Display dropdown button with localized title */}
      <DropdownButton title={signText} tabKey={tabKey} />
      {/** Display sign in form */}
      <div className="dropdown-container w-full rounded-3xl bg-white">
        <SignInForm
          className={'p-8 px-14 max-sm:px-8'}
          dict={dict}
          isActive={false}
        />
      </div>
    </DropdownAnimations>
  );
};

export default SignIn;
