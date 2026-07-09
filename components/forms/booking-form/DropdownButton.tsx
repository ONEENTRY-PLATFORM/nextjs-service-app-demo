'use client';

import type { JSX } from 'react';

import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { selectTabsState, setTabsState } from '@/app/store/reducers/CartSlice';
import type { TabKey } from '@/app/types/global';
import ChevronDownIcon from '@/components/icons/chevron-down';

/**
 * DropdownButton Component.
 * @param   {object}      props        - The properties for the component.
 * @param   {string}      props.title  - The title to display on the button.
 * @param   {TabKey}      props.tabKey - A unique key to identify the tab state.
 * @returns {JSX.Element}              A button that toggles the active state of a tab.
 */
const DropdownButton = ({
  title,
  tabKey,
}: {
  title: string;
  tabKey: TabKey;
}): JSX.Element => {
  const dispatch = useAppDispatch();
  /** Get tab state including active and disabled status */
  const { isActive, disabled } = useAppSelector((state) =>
    selectTabsState(tabKey, state),
  );
  /** Function to toggle the tab's active state */
  const toggleTabState = () => {
    if (!disabled) {
      dispatch(setTabsState({ key: tabKey, value: !isActive }));
    }
  };

  /* Render dropdown button with title and chevron icon */
  return (
    <button
      data-testid={`booking-tab-${tabKey}`}
      className="mb-4 flex w-full items-center justify-center gap-2 rounded-card border border-solid border-white bg-transparent px-16 py-2.5 text-center text-lg text-nowrap text-white transition-colors duration-300 hover:border-transparent hover:bg-white/30 focus-visible:text-fuchsia-50 focus-visible:outline-fuchsia-50 disabled:border-neutral-300 disabled:text-neutral-300"
      onClick={(e) => {
        e.preventDefault();
        toggleTabState();
      }}
    >
      <span>{title}</span>
      <ChevronDownIcon active={isActive} />
    </button>
  );
};

export default DropdownButton;
