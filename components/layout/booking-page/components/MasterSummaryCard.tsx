import Image from 'next/image';
import type { JSX } from 'react';

import { PINK } from '../constants';
import type { BookingMaster } from '../types';

/**
 * MasterSummaryCard — the picked-specialist block of the booking summary: a
 * round portrait with a pink ring and the specialty tag pills (mock
 * `BookingSummary` master row).
 * @param   {object}        props        - Component properties
 * @param   {BookingMaster} props.master - Picked specialist
 * @returns {JSX.Element}                Specialist summary card
 */
const MasterSummaryCard = ({
  master,
}: {
  master: BookingMaster;
}): JSX.Element => (
  <div
    data-testid="booking-summary-master"
    className="flex items-center gap-3 rounded-xl p-3"
    style={{ background: `${PINK}08` }}
  >
    <div className="relative size-10 shrink-0 overflow-hidden rounded-full border-2 border-fuchsia-500">
      {master.photo && (
        <Image
          fill
          sizes="40px"
          src={master.photo}
          alt={master.name}
          className="object-cover object-top"
        />
      )}
    </div>
    <div className="min-w-0">
      <p className="text-base font-semibold text-slate-400">{master.name}</p>
      <div className="mt-1 flex flex-wrap gap-1">
        {master.specialties.map((tag) => (
          <span
            key={tag}
            className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
            style={{ background: `${PINK}18`, color: PINK }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  </div>
);

export default MasterSummaryCard;
