'use client';

import type { JSX } from 'react';

/** The two switchable panels on mobile. */
export type ProfileTab = 'profile' | 'history';

/**
 * MobileTabs renders a pill toggle (shown only below `lg`) that switches
 * between the Profile card and the visit History column on small screens.
 * @param   {object}                    props              - Component props
 * @param   {ProfileTab}                props.active       - Currently active tab
 * @param   {(tab: ProfileTab) => void} props.onChange     - Called with the selected tab key
 * @param   {string}                    props.profileLabel - Label for the profile tab
 * @param   {string}                    props.historyLabel - Label for the history tab
 * @returns {JSX.Element}                                  Pill toggle element
 */
const MobileTabs = ({
  active,
  onChange,
  profileLabel,
  historyLabel,
}: {
  active: ProfileTab;
  onChange: (tab: ProfileTab) => void;
  profileLabel: string;
  historyLabel: string;
}): JSX.Element => {
  const tabs = [
    { key: 'profile', label: profileLabel },
    { key: 'history', label: historyLabel },
  ] as const;

  return (
    <div className="mb-6 lg:hidden">
      <div className="flex rounded-2xl p-1" style={{ background: '#eef0f4' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className="flex-1 rounded-xl py-2.5 text-sm font-bold tracking-wide uppercase transition-all"
            style={
              active === tab.key
                ? {
                    background: '#fff',
                    color: '#ed21f1',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }
                : { background: 'transparent', color: '#a8a9b5' }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileTabs;
