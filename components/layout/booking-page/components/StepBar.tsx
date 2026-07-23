'use client';

import { Calendar, Check, MapPin, Scissors, User } from 'lucide-react';
import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';

import { BRAND_GRADIENT, CYAN, MUTED, PINK } from '../constants';
import type { StepKey } from '../types';

/** Label, dictionary marker and icon per wizard step (mock `BookingPage.tsx` → `STEP_DEFS`) */
const STEP_DEFS: Record<
  StepKey,
  { label: string; marker: string; Icon: typeof MapPin }
> = {
  salon: { label: 'Studio', marker: 'studio_text', Icon: MapPin },
  service: { label: 'Service', marker: 'service_text', Icon: Scissors },
  specialist: { label: 'Specialist', marker: 'specialist_text', Icon: User },
  datetime: {
    label: 'Date & Time',
    marker: 'booking_step_datetime_label',
    Icon: Calendar,
  },
};

/**
 * StepBar — the horizontal progress bar of the booking wizard, ported from
 * the static-html mock (`BookingPage.tsx` → `StepBar`): a circle with the
 * step icon (gradient when active, cyan check when done) joined by thin
 * connector lines; completed steps are clickable to go back.
 * @param   {object}                props            - Component properties
 * @param   {StepKey[]}             props.steps      - Ordered step keys of the current flow
 * @param   {number}                props.currentIdx - Index of the active step
 * @param   {(idx: number) => void} props.onGo       - Jump to a completed step by index
 * @returns {JSX.Element}                            Step bar
 */
const StepBar = ({
  steps,
  currentIdx,
  onGo,
}: {
  steps: StepKey[];
  currentIdx: number;
  onGo: (idx: number) => void;
}): JSX.Element => {
  const dict = useDict();

  return (
    <div className="flex w-full items-center justify-center gap-0">
      {steps.map((key, idx) => {
        const def = STEP_DEFS[key];
        const done = currentIdx > idx;
        const active = currentIdx === idx;
        const { Icon } = def;
        return (
          <div key={key} className="flex items-center">
            <button
              onClick={() => done && onGo(idx)}
              className={`group flex flex-col items-center gap-1 ${done ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div
                className="flex size-10 items-center justify-center rounded-full transition-all duration-300"
                style={{
                  background: active
                    ? BRAND_GRADIENT
                    : done
                      ? `linear-gradient(135deg,${CYAN}55,${CYAN}33)`
                      : '#f7f7fb',
                  border: active
                    ? 'none'
                    : done
                      ? `2px solid ${CYAN}`
                      : `2px solid #e8e8f0`,
                  boxShadow: active ? `0 0 20px ${PINK}55` : 'none',
                }}
              >
                {done ? (
                  <Check size={16} color={CYAN} />
                ) : (
                  <Icon size={16} color={active ? '#fff' : MUTED} />
                )}
              </div>
              <span
                style={{ color: active ? PINK : done ? CYAN : MUTED }}
                className="hidden text-sm font-medium whitespace-nowrap sm:block"
              >
                {(dict?.[def.marker]?.value as string | undefined) || def.label}
              </span>
            </button>
            {idx < steps.length - 1 && (
              <div
                className="mx-1 h-0.5 w-8 rounded-full transition-all duration-500 sm:mx-2 sm:w-20"
                style={{
                  background: done
                    ? `linear-gradient(90deg,${CYAN},${CYAN}44)`
                    : '#f7f7fb',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepBar;
