'use client';

import type { Dispatch, JSX, ReactNode } from 'react';
import { createContext, useState } from 'react';

/**
 * Overlays the drawer can open: the inline mobile menu panel or one of the
 * auth/profile forms of the popup modal. `''` = nothing open. A union (not
 * `string`) so a typo in any `setComponent` call site fails to compile.
 */
export type PopupKey =
  | ''
  | 'MobileMenu'
  | 'ForgotPasswordForm'
  | 'ResetPasswordForm'
  | 'SignInForm'
  | 'SignUpForm'
  | 'UserForm'
  | 'VerificationForm';

/**
 * Flow the OTP `VerificationForm` finishes: `'activateUser'` completes a
 * registration, `'checkCode'` continues a password reset. `''` = none pending.
 */
export type PopupAction = '' | 'activateUser' | 'checkCode';

/** Modal transition phase — `'close'` plays the closing animation first. */
export type PopupTransition = '' | 'close';

/** Step-switch slide direction of the form modal. */
export type PopupDirection = 'forward' | 'backward';

/**
 * Drawer context.
 * @param component     - component to open.
 * @param open          - open state.
 * @param action        - action to perform.
 * @param transition    - transition type.
 * @param direction     - step-switch direction ('forward' | 'backward') driving the horizontal slide.
 * @param setComponent  - set component to open.
 * @param setOpen       - set open state.
 * @param setAction     - set action to perform.
 * @param setTransition - set transition type.
 * @param setDirection  - set the step-switch slide direction.
 */
export const OpenDrawerContext = createContext<{
  component: PopupKey;
  open: boolean;
  action: PopupAction;
  transition: PopupTransition;
  direction: PopupDirection;
  setComponent: Dispatch<PopupKey>;
  setOpen: Dispatch<boolean>;
  setAction: Dispatch<PopupAction>;
  setTransition: Dispatch<PopupTransition>;
  setDirection: Dispatch<PopupDirection>;
}>({
  open: false,
  component: '',
  action: '',
  transition: '',
  direction: 'forward',
  setOpen(): void {},
  setComponent(): void {},
  setAction(): void {},
  setTransition(): void {},
  setDirection(): void {},
});

/**
 * Context provider for modals
 * @param   {object}      props          - Component props
 * @param   {ReactNode}   props.children - children ReactNode
 * @returns {JSX.Element}                Drawer context provider
 */
export const OpenDrawerProvider = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const [open, setOpen] = useState<boolean>(false);
  const [component, setComponent] = useState<PopupKey>('');
  const [action, setAction] = useState<PopupAction>('');
  const [transition, setTransition] = useState<PopupTransition>('');
  /**
   * Direction the next form-step swap slides in from. Set by the in-modal
   * navigation buttons right before `setComponent` so `FormAnimations` can
   * play a `forward` (→) or `backward` (←) horizontal slide.
   */
  const [direction, setDirection] = useState<PopupDirection>('forward');

  return (
    <OpenDrawerContext.Provider
      value={{
        component,
        setComponent,
        open,
        setOpen,
        action,
        setAction,
        transition,
        setTransition,
        direction,
        setDirection,
      }}
    >
      {children}
    </OpenDrawerContext.Provider>
  );
};
