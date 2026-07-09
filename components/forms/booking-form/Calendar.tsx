'use client';

import '@/app/styles/calendar.css';

import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import utc from 'dayjs/plugin/utc';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';

import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {
  addServiceToCart,
  selectActiveItemId,
} from '@/app/store/reducers/CartSlice';
import useCartItem from '@/app/store/useCartItem';
import CalendarAnimations from '@/components/forms/booking-form/animations/CalendarAnimations';

import DropdownAnimations from './animations/DropdownAnimations';
import type { TimeSlotData } from './calendar/TimeSlots';
import TimeSlots from './calendar/TimeSlots';
import DropdownButton from './DropdownButton';

dayjs.extend(utc);
dayjs.extend(dayOfYear);

/**
 * Filter time intervals by a specific date.
 *
 * This function filters an array of time intervals to only include those
 * that overlap with the specified target date.
 * @param   {[string, string][]} intervals  - Array of time intervals as string tuples [start, end].
 * @param   {Date}               targetDate - Date to filter intervals by.
 * @returns {[string, string][]}            Filtered array of intervals that match the target date.
 */
const filterIntervalsByDate = (
  intervals: [string, string][],
  targetDate: Date,
): [string, string][] => {
  /** Create start and end of day in UTC using dayjs */
  const startOfDay = dayjs(targetDate).startOf('day').utc();
  const endOfDay = dayjs(targetDate).endOf('day').utc();

  return intervals?.filter(([start, end]) => {
    /** Parse interval start and end as UTC */
    const intervalStart = dayjs(start).utc();
    const intervalEnd = dayjs(end).utc();

    /** Check if the interval overlaps with the target day */
    return intervalStart.isBefore(endOfDay) && intervalEnd.isAfter(startOfDay);
  });
};

/**
 * Calendar layout component for booking appointments.
 *
 * This component renders a calendar interface that allows users to select
 * an available date and time slot for their appointment.
 * @param   {object}           props      - Component properties.
 * @param   {IAttributeValues} props.dict - Dictionary object containing localized text values.
 * @returns {JSX.Element}                 JSX.Element representing the calendar component.
 */
const CalendarLayout = ({ dict }: { dict: IAttributeValues }): JSX.Element => {
  const tabKey = 'calendar';
  const dispatch = useAppDispatch();

  /** State for selected date, time, datetime and current interval */
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState<string>('');
  const [dateTime, setDateTime] = useState<Date>();
  const [currentInterval, setCurrentInterval] = useState<Date[]>([]);

  const { select_date_time_text } = dict;
  const activeId = useAppSelector(selectActiveItemId);

  /** Hydrated master entity for the active cart row */
  const { master } = useCartItem();
  const schedule = (
    master?.attributeValues?.master_schedule?.value as
      | {
          values: Array<{
            external: { date: string }[];
            timeIntervals: [string, string][];
          }>;
        }[]
      | undefined
  )?.[0]?.values;

  /** Days of year the master is unavailable, from schedule external overrides */
  const holidays = schedule
    ?.flatMap((interval) => interval.external)
    .filter((h) => h && dayjs(h.date).dayOfYear())
    .map((h) => dayjs(h.date).dayOfYear());

  /** Generate and format time intervals based on selected date */
  const timeIntervals: TimeSlotData[] | undefined = filterIntervalsByDate(
    schedule?.flatMap((interval) => interval.timeIntervals) ?? [],
    date,
  )?.map((interval) => {
    const d = dayjs(interval[0]).toDate();
    return {
      interval: interval.map((point) => dayjs(point).toDate()),
      time: `${d.getUTCHours()}:${d.getUTCMinutes() === 0 ? '00' : d.getUTCMinutes()}`,
      isDisabled: false,
      isSelected: false,
    };
  });

  /** Update datetime when date or time changes */
  useEffect(() => {
    const [hh, mm] = time.split(':').map(Number);
    // Defer state update to avoid cascading renders
    const timer = setTimeout(() => {
      setDateTime(
        dayjs(date)
          .hour(hh || 0)
          .minute(mm || 0)
          .second(0)
          .toDate(),
      );
    }, 0);
    return () => clearTimeout(timer);
  }, [date, time]);

  /** Dispatch updated service data when datetime or interval changes */
  useEffect(() => {
    if (dateTime) {
      dispatch(
        addServiceToCart({
          id: activeId,
          date: dateTime,
          interval: currentInterval,
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, dateTime, currentInterval]);

  /* Render calendar layout with date picker and time slots */
  return (
    <DropdownAnimations
      id={tabKey}
      className="mb-4 flex w-full flex-col items-center"
      index={4}
      tabKey={tabKey}
    >
      {/** Display dropdown button with localized title */}
      <DropdownButton
        title={(select_date_time_text?.value as string | undefined) ?? ''}
        tabKey={tabKey}
      />
      <section className="dropdown-container flex w-full flex-col rounded-3xl bg-white px-8 text-xl whitespace-nowrap text-neutral-700 max-sm:px-5">
        <CalendarAnimations
          className="mx-auto max-w-87.5 py-9 max-sm:max-w-75"
          tabKey={tabKey}
        >
          {/** Display calendar component for date selection */}
          <Calendar
            locale="en-US"
            view="month"
            onChange={(value) => setDate(value as Date)}
            value={date}
            tileDisabled={({ date }) =>
              holidays?.includes(dayjs(date).dayOfYear()) ?? false
            }
          />
          {/** Display time slots for selected date */}
          {timeIntervals && (
            <TimeSlots
              timeSlots={timeIntervals}
              currentTime={time}
              setTime={setTime}
              setInterval={setCurrentInterval}
            />
          )}
        </CalendarAnimations>
      </section>
    </DropdownAnimations>
  );
};

export default CalendarLayout;
