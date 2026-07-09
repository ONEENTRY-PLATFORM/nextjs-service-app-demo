/* eslint-disable jsdoc/no-undefined-types */
'use client';

import type { IAuthFormData } from 'oneentry/dist/auth-provider/authProvidersInterfaces';
import type { IAttributes } from 'oneentry/dist/base/utils';
import type { FormEvent, JSX } from 'react';
import { useContext, useState } from 'react';
import { toast } from 'react-toastify';

import { getApi, useGetFormByMarkerQuery } from '@/app/api';
import { useAppSelector } from '@/app/store/hooks';
import { AuthContext } from '@/app/store/providers/AuthContext';
import type { FormProps } from '@/app/types/global';

import AuthError from '../pages/AuthError';
import SpinnerLoader from '../shared/SpinnerLoader';
import ErrorMessage from './inputs/ErrorMessage';
import FormInput from './inputs/FormInput';
import SubmitButton from './inputs/FormSubmitButton';

/**
 * Type definition for input value
 */
export type InputValue = {
  value: string;
  valid: boolean;
  [key: string]: unknown;
};

/**
 * UserForm component renders a form for user profile management.
 * Allows authenticated users to update their personal information such as email, phone, and password.
 * @param   {FormProps}        props      - Component props
 * @param   {IAttributeValues} props.dict - Dictionary containing localized strings for form labels and messages
 * @returns {JSX.Element}                 User form component or authentication error if user is not authenticated
 */
const UserForm = ({ dict }: FormProps): JSX.Element => {
  const { isAuth, refreshUser, user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [isError, setError] = useState('');

  /** Get form by marker with RTK */
  const { data, isLoading, error } = useGetFormByMarkerQuery({
    marker: 'reg',
  });

  /** get fields from formFieldsReducer */
  const fields = useAppSelector((state) => state.formFieldsReducer.fields);

  /** Prepare form data for user update */
  const formData = (data?.attributes as IAttributes[] | undefined)
    ?.map((field: IAttributes) => {
      if (field.marker !== 'email_notification_reg') {
        return {
          marker: field.marker,
          value: fields[field.marker as keyof typeof fields]?.value || '',
          type: 'string',
        };
      }
      return;
    })
    .filter(Boolean) as IAuthFormData[];

  /**
   * Update user data
   * @param {FormEvent<HTMLFormElement>} e - form submit event
   */
  const onUpdateUserData = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    /** Validate required fields before submission */
    if (!fields.password_reg || !fields.phone_reg || !fields.email_reg) {
      return;
    }
    /** Attempt to update user data */
    try {
      /** Set loading state during update process */
      setLoading(true);

      /** Update user information via API if form identifier exists */
      if (user?.formIdentifier) {
        await getApi().Users.updateUser({
          formIdentifier: user.formIdentifier,
          formData,
          authData: [
            {
              marker: 'password_reg',
              value: fields.password_reg.value,
            },
          ],
          notificationData: {
            email: fields.email_reg.value,
            phonePush: [],
            phoneSMS: fields.phone_reg.value,
          },
          state: {},
        });
      }

      /** Refresh user data after successful update */
      refreshUser();
      /** Clear any previous error messages */
      setError('');
      /** Show success notification */
      toast('Data saved!');
    } catch (error) {
      /** Set error message if update fails */
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      /** Reset loading state after update attempt */
      setLoading(false);
    }
  };

  /** Show loading spinner while form data is being fetched */
  if (isLoading) {
    return <SpinnerLoader />;
  }

  /** Show authentication error if user is not authenticated or data is missing */
  if (!isAuth || error || !user?.formData) {
    return <AuthError dict={dict} />;
  }

  /** Render user profile form with all fields */
  return (
    <form
      className="flex min-h-full w-full max-w-107.5 flex-col gap-4 text-xl leading-5"
      onSubmit={onUpdateUserData}
    >
      {/** Render form fields excluding email notification field */}
      <div className="relative mb-4 box-border flex shrink-0 flex-col gap-4">
        {(data?.attributes as IAttributes[] | undefined)
          ?.filter(
            (field: { marker: string }) =>
              field.marker !== 'email_notification_reg',
          )
          .map((field: IAttributes, index: number) => {
            const fieldData =
              Array.isArray(user?.formData) &&
              (user.formData.find((item) => item.marker === field.marker) as
                { value?: string } | undefined);
            return (
              <FormInput key={index} index={index} {...field} {...fieldData} />
            );
          })}
      </div>
      {/** Render submit button for form submission */}
      <SubmitButton
        title={dict?.save_button_text?.value}
        isLoading={loading}
        index={10}
      />
      {/** Display error message if present */}
      {isError && <ErrorMessage error={isError} />}
    </form>
  );
};

export default UserForm;
