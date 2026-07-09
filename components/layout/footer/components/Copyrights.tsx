import type { JSX } from 'react';

import { copyrightsData } from '@/components/data';

/**
 * Copyrights component
 * Displays copyright information including date and company name.
 * @returns {JSX.Element} JSX.Element
 */
const Copyrights = (): JSX.Element => {
  return (
    <>
      <span className="leading-5">{copyrightsData.date}</span>
      <span className="leading-5">{copyrightsData.company}</span>
    </>
  );
};

export default Copyrights;
