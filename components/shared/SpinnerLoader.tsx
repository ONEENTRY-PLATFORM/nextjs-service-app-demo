'use client';

import type { JSX } from 'react';

import Spinner from './Spinner';

/**
 * Spinner loader component
 *
 * This component renders a spinner loader in a container with a maximum height.
 * It's a wrapper around the Spinner component that provides consistent sizing.
 * @returns {JSX.Element} Spinner loader component
 */
const SpinnerLoader = (): JSX.Element => {
  return (
    <div className="relative aspect-square size-full max-h-62.5 overflow-hidden">
      <Spinner />
    </div>
  );
};

export default SpinnerLoader;
