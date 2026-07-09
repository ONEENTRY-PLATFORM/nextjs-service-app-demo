import type { Dispatch, JSX, SetStateAction } from 'react';

/**
 * Time slot button component for the booking calendar.
 *
 * This component represents a single time slot button in the booking calendar.
 * It handles user interaction for selecting a time slot and updates the parent
 * component's state accordingly. The button's appearance changes based on
 * whether it's selected, disabled, or available.
 * @param   {object}                                 props                 - Component props
 * @param   {object}                                 props.slot            - Object containing time slot data
 * @param   {string}                                 props.slot.time       - The time string to display on the button (e.g., "10:00")
 * @param   {Date[]}                                 props.slot.interval   - Array of Date objects representing the time interval
 * @param   {boolean}                                props.slot.isDisabled - Whether the time slot is disabled (unavailable)
 * @param   {string}                                 props.currentTime     - The currently selected time string
 * @param   {Dispatch<SetStateAction<string>>}       props.setTime         - Function to update the selected time in the parent component
 * @param   {Dispatch<SetStateAction<[Date, Date]>>} props.setInterval     - Function to update the selected time interval in the parent component
 * @returns {JSX.Element}                                                  JSX.Element representing the time slot button
 */
const TimeSlot = ({
  slot,
  currentTime,
  setTime,
  setInterval,
}: {
  slot: {
    time: string;
    interval: Date[];
    isDisabled?: boolean;
  };
  currentTime: string;
  setTime: Dispatch<SetStateAction<string>>;
  setInterval: Dispatch<SetStateAction<Date[]>>;
}): JSX.Element => {
  const { time, interval, isDisabled } = slot;

  /** Determine className based on current state */
  let className =
    'justify-center items-center transition-colors duration-300 disabled:bg-neutral-300/50 disabled:text-neutral-300 rounded-card ';

  if (currentTime === time) {
    className +=
      'text-white bg-fuchsia-500 border-fuchsia-500hover:bg-fuchsia-600 focus-visible:outline-fuchsia-600';
  } else if (isDisabled) {
    className +=
      'justify-center items-center border border-solid transition-colors duration-300 disabled:border-neutral-300 disabled:text-neutral-300 bg-transparent border-slate-300 text-slate-300 hover:border-slate-600 hover:text-slate-600 focus-visible:outline-slate-600 focus-visible:text-slate-600';
  } else {
    className +=
      'justify-center items-center border border-solid transition-colors duration-300 disabled:border-neutral-300 disabled:text-neutral-300 px-3.5 py-1 h-[35px] text-[15px] rounded-3xl font-bold tracking-wide text-fuchsia-500 border-fuchsia-500 hover:border-fuchsia-600 hover:text-fuchsia-600 focus-visible:outline-fuchsia-600 focus-visible:text-fuchsia-600 bg-transparent';
  }

  return (
    <button
      className={className}
      onClick={() => {
        setTime(time);
        setInterval(interval);
      }}
      disabled={isDisabled}
    >
      <time>{time}</time>
    </button>
  );
};

export default TimeSlot;
