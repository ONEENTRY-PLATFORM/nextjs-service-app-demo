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

  /** Define array of title data mapping components to their display titles */
  const titlesData: Array<{ component: string; value: string | undefined }> = [
    {
      component: 'CalendarForm',
      value: 'Calendar',
    },
    {
      component: 'ForgotPasswordForm',
      value: forgot_password_text?.value as string | undefined,
    },
    {
      component: 'ResetPasswordForm',
      value: reset_password_text?.value as string | undefined,
    },
    {
      component: 'SignInForm',
      value: sign_in_text?.value as string | undefined,
    },
    {
      component: 'SignUpForm',
      value: sign_up_text?.value as string | undefined,
    },
    {
      component: 'VerificationForm',
      value: verification?.value as string | undefined,
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
        className="fixed top-1/2 left-1/2 z-500 flex size-full max-w-full -translate-1/2 flex-col overflow-auto bg-white p-6 px-16 pt-32 shadow-xl max-sm:px-8 xl:px-24 sm:px-16 md:overflow-hidden md:rounded-3xl lg:h-auto lg:w-137.5 lg:p-10 lg:px-24 lg:pt-32"
      >
        <header className="absolute top-0 left-0 flex w-full items-start gap-5 bg-gradient-2 px-16 py-6 pr-6 text-4xl leading-8 text-white max-sm:px-8 lg:pl-24">
          <div className="mt-8 flex-auto self-end text-[32px] leading-10 max-sm:mt-0 xl:text-[42px]">
            {title}
          </div>
          <CloseModal />
        </header>
        <Form className={''} dict={dict} isActive={true} />
      </div>
      <ModalBackdrop />
    </ModalAnimations>
  );
};

export default Modal;
