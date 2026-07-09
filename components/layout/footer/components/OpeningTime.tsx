import parse from 'html-react-parser';
import type { JSX, Key } from 'react';

import { getBlockByMarker } from '@/app/api';

/**
 * OpeningTime component to display opening hours
 * @returns {Promise<JSX.Element>} JSX.Element representing the opening time section
 */
const OpeningTime = async (): Promise<JSX.Element> => {
  /** Fetch block data by marker for opening time information */
  const { block } = await getBlockByMarker('opening_time');
  /** Extract opening time values from block attributes with fallback to empty array */
  const openingTime =
    (block?.attributeValues.opening_time?.value as
      { header: string; htmlValue: string }[] | undefined) || [];

  /** Render opening time entries as formatted rows */
  return (
    <>
      {openingTime.map((time, i: Key) => {
        return (
          <div key={i} className="flex justify-between gap-5">
            <div>{time.header}</div>
            <div>{time.htmlValue && parse(time.htmlValue)}</div>
          </div>
        );
      })}
    </>
  );
};

export default OpeningTime;
