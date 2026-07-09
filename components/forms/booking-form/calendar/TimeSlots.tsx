/* eslint-disable jsdoc/check-param-names */
import type { Dispatch, JSX, SetStateAction } from 'react';

import TimeSlot from './TimeSlot';

export interface TimeSlotData {
  time: string;
  interval: Date[];
  isSelected?: boolean;
  isDisabled?: boolean;
}

/**
 * Time slots grid component for the booking calendar.
 *
 * This component renders a grid of time slot buttons for the booking calendar.
 * It takes an array of time slot data and renders individual TimeSlot components
 * in a responsive grid layout. The component manages the selection state of time slots
 * and communicates changes to the parent component.
 * @param   {object}                                 props                        - Component props
 * @param   {Array<object>}                          props.timeSlots              - Array of time slot objects
 * @param   {string}                                 props.timeSlots[].time       - The time string to display on the button (e.g., "10:00")
 * @param   {Date[]}                                 props.timeSlots[].interval   - Array of Date objects representing the time interval
 * @param   {boolean}                                props.timeSlots[].isDisabled - Whether the time slot is disabled (unavailable)
 * @param   {string}                                 props.currentTime            - The currently selected time string
 * @param   {Dispatch<SetStateAction<string>>}       props.setTime                - Function to update the selected time in the parent component
 * @param   {Dispatch<SetStateAction<[Date, Date]>>} props.setInterval            - Function to update the selected time interval in the parent component
 * @returns {JSX.Element}                                                         JSX.Element representing the time slots grid
 */
const TimeSlots = ({
  timeSlots,
  currentTime,
  setTime,
  setInterval,
}: {
  timeSlots: {
    time: string;
    interval: Date[];
    isSelected?: boolean;
    isDisabled?: boolean;
  }[];
  currentTime: string;
  setTime: Dispatch<SetStateAction<string>>;
  setInterval: Dispatch<SetStateAction<Date[]>>;
}): JSX.Element => {
  return (
    <div className="flex w-full flex-col gap-4 text-base font-bold tracking-wide whitespace-nowrap">
      <div className="grid grid-cols-4 flex-wrap justify-around gap-x-1 gap-y-3">
        {timeSlots?.map((slot) => (
          <TimeSlot
            key={slot.time}
            slot={slot}
            currentTime={currentTime}
            setTime={setTime}
            setInterval={setInterval}
          />
        ))}
      </div>
    </div>
  );
};

export default TimeSlots;
