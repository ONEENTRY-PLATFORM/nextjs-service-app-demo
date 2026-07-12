'use client';

import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { IUserEntity } from 'oneentry/dist/users/usersInterfaces';
import type { JSX } from 'react';

import { UserForm } from '@/components/forms';

import Avatar from './Avatar';
import { getUserDisplayName } from './getUserDisplayName';
import SignOutButton from './SignOutButton';

/**
 * ProfileCard renders the profile side of the account page: a white card with a
 * header row (title + sign-out), a gradient avatar with the user's name, and
 * the existing user profile form below.
 * @param   {object}           props        - Component props
 * @param   {IAttributeValues} props.dict   - Dictionary with localized strings
 * @param   {IPagesEntity}     props.page   - Profile page entity (provides the title)
 * @param   {IUserEntity}      [props.user] - Authenticated user entity
 * @returns {JSX.Element}                   Profile card element
 */
const ProfileCard = ({
  dict,
  page,
  user,
}: {
  dict: IAttributeValues;
  page: IPagesEntity;
  user?: IUserEntity | undefined;
}): JSX.Element => {
  /** Card title from CMS with an English fallback. */
  const title = page.localizeInfos?.title || 'Profile';
  /** Best-effort display name for the avatar and name row. */
  const name = getUserDisplayName(user);
  /** Sign-out label from the dictionary with an English fallback. */
  const signOutLabel =
    (dict.sign_out_text?.value as string | undefined) || 'Sign out';

  return (
    <div
      className="rounded-2xl bg-white p-6"
      style={{ boxShadow: '0 4px 24px rgba(237,33,241,0.08)' }}
    >
      {/* Header row: title + sign out */}
      <div className="mb-5 flex items-center justify-between">
        <h1
          className="font-light text-slate-400 capitalize"
          style={{ fontSize: '1.25rem' }}
        >
          {title}
        </h1>
        <SignOutButton label={signOutLabel} />
      </div>

      {/* Avatar + name */}
      <div className="mb-6 flex items-center gap-4">
        <Avatar name={name} />
        <p className="text-base font-bold text-slate-400">{name}</p>
      </div>

      {/* Existing profile form (internals untouched) */}
      <UserForm dict={dict} className={''} />
    </div>
  );
};

export default ProfileCard;
