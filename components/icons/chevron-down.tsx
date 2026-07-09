'use client';

import { useEffect, useState } from 'react';

const ChevronDownIcon = ({ active }: { active: boolean }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Defer state update to avoid cascading renders
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  /** During server-side rendering and initial client render, */
  /** we don't apply the rotation class to prevent hydration mismatches */
  /** After mounting, we use the actual active state */
  const isVisibleActive = isMounted ? active : false;

  return (
    <svg
      width="33"
      height="32"
      viewBox="0 0 33 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`my-auto w-2.5 shrink-0 fill-current ${isVisibleActive ? 'rotate-180' : ''}`}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.68344 7.2023C3.99204 6.00276 6.02529 6.09116 7.22484 7.39975L16.6411 17.6721L26.0574 7.39975C27.2569 6.09116 29.2902 6.00276 30.5988 7.2023C31.9074 8.40185 31.9958 10.4351 30.7962 11.7437L19.0105 24.6008C18.4017 25.265 17.5421 25.6431 16.6411 25.6431C15.7401 25.6431 14.8805 25.265 14.2717 24.6008L2.48599 11.7437C1.28645 10.4351 1.37485 8.40185 2.68344 7.2023Z"
      />
    </svg>
  );
};

export default ChevronDownIcon;
