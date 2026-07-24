'use client';

import { useState } from 'react';

import { useAppSelector } from '@/app/store/hooks';
import { selectCartSelection } from '@/app/store/reducers/CartSlice';
import { useHydrated } from '@/app/store/useHydrated';

import type { PreselectPreset } from '../bookingReducer';
import type { BookingData, BookingService } from '../types';
import type { ReschedulePrefill } from './useReschedulePrefill';

/**
 * useBookingPreselect — applies the preselection carried by the reschedule
 * query or the booking cart, driving the wizard into the matching flow, step
 * and selection.
 *
 * The cart lives in `redux-persist` (localStorage), so the server cannot know
 * it. Applying the preselection during the FIRST client render would make the
 * hydrated tree differ from the server HTML — React throws "Hydration failed"
 * and re-renders the whole page on the client. `useHydrated` returns the server
 * snapshot (`false`) for SSR *and* the hydration render, then the client
 * snapshot (`true`) right after: the first render matches the server, and the
 * jump to the preselected step lands in the very next commit.
 *
 * The preselection is applied while rendering (React's "adjust state on prop
 * change" pattern, no effect): once per distinct cart content and never over a
 * flow the user has already started themselves.
 * @param {object}                            input                 - Hook input
 * @param {BookingData}                       input.data            - Salons, services and specialists from the CMS
 * @param {ReschedulePrefill}                 input.reschedule      - The `?reschedule={orderId}` prefill
 * @param {number[]}                          input.queryProductIds - The `?services=` prefill (an offer's bundled services)
 * @param {boolean}                           input.touched         - The user has already interacted with the wizard
 * @param {(preset: PreselectPreset) => void} input.preselect       - Applies the resolved preselection (one `PRESELECT`)
 */
export const useBookingPreselect = ({
  data,
  reschedule,
  queryProductIds,
  touched,
  preselect,
}: {
  data: BookingData;
  reschedule: ReschedulePrefill;
  queryProductIds: number[];
  touched: boolean;
  preselect: (preset: PreselectPreset) => void;
}): void => {
  const { salons, services, masters } = data;

  const cartItem = useAppSelector(selectCartSelection);

  /**
   * A reschedule wins over the cart: it names the appointment being moved, and
   * unlike the cart it can carry every service of a bundled visit. The
   * `?services=` query ranks next — it is scoped to this navigation (an offer's
   * bundle), so it must beat whatever the cart still remembers from before.
   */
  /**
   * An explicit `?services=` navigation replaces the cart rather than merging
   * with it — a specialist left in the cart by an earlier booking must not
   * hijack an offer into the specialist-first flow.
   */
  const fromQuery = queryProductIds.length > 0;
  const cartMasterId =
    reschedule.masterId ?? (fromQuery ? undefined : cartItem?.masterId);
  const cartSalonId =
    reschedule.salonId ?? (fromQuery ? undefined : cartItem?.salonId);
  const preProductIds =
    reschedule.productIds.length > 0
      ? reschedule.productIds
      : queryProductIds.length > 0
        ? queryProductIds
        : cartItem?.productId
          ? [cartItem.productId]
          : [];

  const hydrated = useHydrated();

  const cartKey = hydrated
    ? `${cartMasterId ?? ''}:${preProductIds.join(',')}:${cartSalonId ?? ''}`
    : '';
  const [appliedCartKey, setAppliedCartKey] = useState('');

  if (cartKey === appliedCartKey) return;
  setAppliedCartKey(cartKey);

  const preMaster = cartMasterId
    ? masters.find((m) => m.adminId === cartMasterId)
    : undefined;
  /** Every preselected service — a rescheduled visit may bundle several */
  const preServices = preProductIds
    .map((pid) => services.find((s) => s.productId === pid))
    .filter((s): s is BookingService => Boolean(s));
  const preService = preServices[0];
  const preSalon = cartSalonId
    ? salons.find((s) => s.id === cartSalonId)
    : undefined;
  /** Single shared category → that pill, a mixed bundle → All */
  const preCategories = [...new Set(preServices.map((s) => s.category))];
  const preCategory =
    preCategories.length === 1 ? (preCategories[0] ?? 'All') : 'All';

  if (touched) {
    /** Skip — the user is already in a flow of their own */
  } else if (preMaster && preService) {
    /** Repeat/reschedule: everything known → jump to Date & Time */
    preselect({
      patch: {
        flow: 'specialist-first',
        master: preMaster.id,
        serviceIds: preServices.map((s) => s.id),
        salon: preSalon?.id ?? preMaster.salonIds[0] ?? null,
        categoryFilter: preCategory,
      },
      stepIdx: 'last',
    });
  } else if (preMaster) {
    /** From a specialist profile → specialist-first, land on the next step */
    preselect({
      patch: {
        flow: 'specialist-first',
        master: preMaster.id,
        salon:
          preMaster.salonIds.length === 1
            ? (preMaster.salonIds[0] ?? null)
            : null,
      },
      stepIdx: 1,
    });
  } else if (preService) {
    /**
     * From Services & Prices / an offer → salon-first, service locked. When the
     * catalog carried a studio (a specific salon was selected there), preselect
     * it on the salon step so the user lands with that studio already chosen.
     */
    preselect({
      patch: {
        flow: 'salon-first',
        serviceIds: preServices.map((s) => s.id),
        serviceLocked: true,
        categoryFilter: preCategory,
        ...(preSalon ? { salon: preSalon.id } : {}),
      },
      stepIdx: 0,
    });
  }
};
