'use client';

import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX } from 'react';

import SignInButton from '../shared/SignInButton';

/**
 * AuthError page component
 * Displays an authentication error page with 401 status code
 * Typically shown when a user tries to access a protected resource without proper authentication
 * @param   {object}           props      - Component properties
 * @param   {IAttributeValues} props.dict - Dictionary containing localized text values
 * @returns {JSX.Element}                 AuthError page component
 */
const AuthError = ({ dict }: { dict: IAttributeValues }): JSX.Element => {
  /** Localized "authorization required" text with an English fallback. */
  const { auth_required_text } = dict;

  return (
    /** Main container with centered content and vertical padding */
    <div className="flex w-full flex-col items-center px-5 py-24">
      {/* 401 error status code display */}
      <h1 className="mb-6 text-6xl text-slate-700">401</h1>
      {/* Error message with localized text and fallback */}
      <p className="mb-6 text-2xl text-slate-700">
        {(auth_required_text?.value as string | undefined) ||
          'Authorization required'}
      </p>
      {/* Sign in button to allow user to authenticate */}
      <SignInButton dict={dict} />
    </div>
  );
};

export default AuthError;
