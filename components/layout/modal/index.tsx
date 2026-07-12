'use client';

import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { FC, JSX } from 'react';
import { useContext } from 'react';

import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';
import * as forms from '@/components/forms';
import ModalAnimations from '@/components/layout/modal/animations/ModalAnimations';

import CloseModal from './components/CloseModal';
import ModalBackdrop from './components/ModalBackdrop';

/**
 * useTitleData component
 * @param   {object}           props           - Component props
 * @param   {IAttributeValues} props.dict      - Dictionary object
 * @param   {string}           props.component - Name of the component being rendered in the modal
 * @returns {string}                           Title string
 */
const useTitleData = ({
  dict,
  component,
}: {
  dict: IAttributeValues;
  component: string;
}): string => {
  /** Destructure text values from dictionary for form titles */
  const {
    sign_in_text,
    sign_up_text,
    reset_password_text,
    forgot_password_text,
    verification,
  } = dict;

  /**
   * Map each form component to its modal title. Values come from the CMS
   * dictionary with an English fallback, so the header is never blank while the
   * dictionary is not fully filled.
   */
  const titlesData: Array<{ component: string; value: string | undefined }> = [
    {
      component: 'CalendarForm',
      value: 'Calendar',
    },
    {
      component: 'ForgotPasswordForm',
      value:
        (forgot_password_text?.value as string | undefined) ||
        'Forgot Password',
    },
    {
      component: 'ResetPasswordForm',
      value:
        (reset_password_text?.value as string | undefined) || 'Reset Password',
    },
    {
      component: 'SignInForm',
      value: (sign_in_text?.value as string | undefined) || 'Sign In',
    },
    {
      component: 'SignUpForm',
      value: (sign_up_text?.value as string | undefined) || 'Create an Account',
    },
    {
      component: 'VerificationForm',
      value: (verification?.value as string | undefined) || 'Verification',
    },
  ];
  const title = titlesData.find((t) => t.component === component);

  return title?.value ?? '';
};

/**
 * Forms modal component that displays various forms in a modal dialog
 * @param   {object}           props      - Component properties
 * @param   {IAttributeValues} props.dict - Dictionary containing localized texts from server API
 * @returns {JSX.Element}                 Modal with form component or null if form component is not found
 */
const Modal = ({ dict }: { dict: IAttributeValues }): JSX.Element => {
  const { component } = useContext(OpenDrawerContext);

  /** Dynamically select form component by component name */
  const Form: FC<{
    className: string;
    dict: IAttributeValues;
    isActive: boolean;
  }> = forms[component as keyof typeof forms] || null;

  /** Get title data based on current component and dictionary */
  const title = useTitleData({ dict, component });

  /** Don't render if form component is not found */
  if (!Form) {
    return <></>;
  }

  /** Render modal with form component and backdrop */
  return (
    <ModalAnimations component={component}>
      <div
        id="modalBody"
        className="fixed top-1/2 left-1/2 z-500 flex max-h-[90dvh] w-[calc(100%-2rem)] max-w-sm -translate-1/2 flex-col overflow-hidden rounded-3xl bg-white shadow-xl"
      >
        <header
          className="flex items-center justify-between gap-4 px-6 py-5 text-white"
          style={{ background: 'linear-gradient(135deg,#9B4FB2,#ed21f1)' }}
        >
          <div className="text-xl font-semibold">{title}</div>
          <CloseModal />
        </header>
        <div className="overflow-auto px-6 pt-4 pb-2">
          <Form className={''} dict={dict} isActive={true} />
        </div>
      </div>
      <ModalBackdrop />
    </ModalAnimations>
  );
};

export default Modal;
