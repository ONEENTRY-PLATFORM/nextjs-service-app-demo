'use client';

import dynamic from 'next/dynamic';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { ComponentType, JSX } from 'react';
import { useContext } from 'react';

import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';
import ModalAnimations from '@/components/layout/modal/animations/ModalAnimations';
import { useDialogA11y } from '@/components/shared/useDialogA11y';

import CloseModal from './components/CloseModal';
import ModalBackdrop from './components/ModalBackdrop';

/** Props every modal form accepts. */
type ModalFormProps = {
  className: string;
  dict: IAttributeValues;
  isActive: boolean;
};

/**
 * Forms are event-driven — nothing is shown until the user opens the modal —
 * and each one pulls in the OneEntry SDK. Loading them through `dynamic()`
 * instead of a namespace import of the barrel keeps all six (and the SDK)
 * out of the first-load JS of every page; only the opened form is fetched.
 *
 * Each form declares only the props it actually uses (some take just `dict`,
 * some just `className`), while the modal always passes the full set — extra
 * props are simply ignored, hence the single cast to the common shape.
 *
 * The contact form is NOT here: it renders inline on `/contacts` as
 * `ContactFormCard`, never in this modal.
 */
const formsMap = {
  ForgotPasswordForm: dynamic(
    () => import('@/components/forms/ForgotPasswordForm'),
  ),
  ResetPasswordForm: dynamic(
    () => import('@/components/forms/ResetPasswordForm'),
  ),
  SignInForm: dynamic(() => import('@/components/forms/SignInForm')),
  SignUpForm: dynamic(() => import('@/components/forms/SignUpForm')),
  UserForm: dynamic(() => import('@/components/forms/UserForm')),
  VerificationForm: dynamic(
    () => import('@/components/forms/VerificationForm'),
  ),
} as unknown as Record<string, ComponentType<ModalFormProps> | undefined>;

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
    calendar_text,
  } = dict;

  /**
   * Map each form component to its modal title. Values come from the CMS
   * dictionary with an English fallback, so the header is never blank while the
   * dictionary is not fully filled.
   */
  const titlesData: Array<{ component: string; value: string | undefined }> = [
    {
      component: 'CalendarForm',
      value: (calendar_text?.value as string | undefined) || 'Calendar',
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
  const { open, component, setTransition } = useContext(OpenDrawerContext);

  /** Dynamically select form component by component name */
  const Form = formsMap[component];

  /** Get title data based on current component and dictionary */
  const title = useTitleData({ dict, component });

  /**
   * Dialog a11y: focus trap/restore, background scroll lock and Escape. Escape
   * triggers the same `transition: 'close'` path as the close button and
   * backdrop, so the closing animation still plays.
   */
  const dialogRef = useDialogA11y({
    isOpen: open,
    onClose: () => setTransition('close'),
  });

  /**
   * Gate on `open` here, not only inside `ModalAnimations`, so the popup owns
   * its own visibility instead of inheriting it from a child's internals.
   * Behaviour is unchanged: `open` stays `true` for the whole closing
   * animation (that is driven by `transition === 'close'`), and
   * `ModalAnimations` already returns nothing at exactly `!open`.
   */
  if (!open || !Form) {
    return <></>;
  }

  /**
   * Render modal with form component and backdrop.
   *
   * The centering wrapper owns the `-translate-1/2` transform; the inner card
   * (`#modalBody`) is what `ModalAnimations` scales/rises on open. Keeping them
   * separate stops GSAP's `scale`/`y` from overwriting the centering transform
   * (GSAP manages `transform` wholesale and does not know about the Tailwind
   * translate).
   */
  return (
    <ModalAnimations component={component}>
      <div className="fixed top-1/2 left-1/2 z-500 w-[calc(100%-2rem)] max-w-sm -translate-1/2">
        <div
          ref={dialogRef}
          id="modalBody"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modalTitle"
          className="flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_32px_80px_rgba(180,40,220,0.30)]"
        >
          <header
            className="flex items-center justify-between gap-4 rounded-t-3xl px-8 pt-8 pb-7 text-white"
            style={{ background: 'linear-gradient(135deg,#9B4FB2,#ed21f1)' }}
          >
            <div id="modalTitle" className="text-[2rem] font-light">
              {title}
            </div>
            <CloseModal />
          </header>
          <div className="overflow-auto px-8 pt-6 pb-4">
            <Form className={''} dict={dict} isActive={true} />
          </div>
        </div>
      </div>
      <ModalBackdrop />
    </ModalAnimations>
  );
};

export default Modal;
