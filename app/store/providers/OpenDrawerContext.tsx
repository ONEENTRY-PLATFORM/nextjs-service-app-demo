'use client';

import type { Dispatch, JSX, ReactNode } from 'react';
import { createContext, useState } from 'react';

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
  component: string;
  open: boolean;
  action: string;
  transition: string;
  direction: string;
  setComponent: Dispatch<string>;
  setOpen: Dispatch<boolean>;
  setAction: Dispatch<string>;
  setTransition: Dispatch<string>;
  setDirection: Dispatch<string>;
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
  const [component, setComponent] = useState<string>('');
  const [action, setAction] = useState<string>('');
  const [transition, setTransition] = useState<string>('');
  /**
   * Direction the next form-step swap slides in from. Set by the in-modal
   * navigation buttons right before `setComponent` so `FormAnimations` can
   * play a `forward` (→) or `backward` (←) horizontal slide.
   */
  const [direction, setDirection] = useState<string>('forward');

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
