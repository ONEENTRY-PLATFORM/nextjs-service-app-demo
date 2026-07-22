'use client';

import { useMemo } from 'react';

import { ANY_MASTER, CATEGORY_ORDER } from './constants';
import type {
  BookingData,
  BookingFlow,
  BookingMaster,
  BookingSalon,
  BookingService,
} from './types';

/** The current selection the cross-filters narrow the rosters by. */
export interface BookingFiltersInput {
  /** Salons, services and specialists from the CMS */
  data: BookingData;
  /** Chosen flow, `null` on the entry screen */
  flow: BookingFlow | null;
  /** Chosen salon id */
  salon: number | null;
  /** Chosen service ids */
  serviceIds: string[];
  /** Chosen specialist id (`''`, id or `__any__`) */
  master: string;
  /** Active category pill */
  categoryFilter: string;
}

/** The rosters each step offers, narrowed by the current selection. */
export interface BookingFiltersState {
  /** Category pill labels (with "All") */
  categories: string[];
  /** Specialists narrowed by salon / service / category */
  filteredMasters: BookingMaster[];
  /** Salons narrowed to the chosen specialist */
  filteredSalons: BookingSalon[];
  /** Services narrowed by the specialist-first flow */
  filteredServices: BookingService[];
}

/**
 * useBookingFilters — the cross-filters between studio, service, specialist and
 * category pill (mock `BookingPage` logic). Pure derivation over the CMS data
 * and the current selection: it owns no state and never writes back, so each
 * step can simply render the roster it is handed.
 * @param   {BookingFiltersInput} input - CMS data plus the current selection
 * @returns {BookingFiltersState}       Category pills and the narrowed rosters
 */
export const useBookingFilters = ({
  data,
  flow,
  salon,
  serviceIds,
  master,
  categoryFilter,
}: BookingFiltersInput): BookingFiltersState => {
  const { salons, services, masters } = data;

  /** Category pills: All + the categories the services actually cover */
  const categories = useMemo(() => {
    const present = new Set(services.map((s) => s.category));
    return [
      'All',
      ...CATEGORY_ORDER.filter((c) => present.has(c)),
      ...[...present].filter((c) => !CATEGORY_ORDER.includes(c)),
    ];
  }, [services]);

  /**
   * Salon → narrows specialists; service → narrows specialists; category tab
   * → narrows specialists. In the specialist-first flow the salon is chosen
   * BY the specialist, so the roster is not pre-filtered by salon. Empty CMS
   * link arrays mean "no restriction".
   */
  const filteredMasters = useMemo(() => {
    return masters.filter((m) => {
      if (
        flow === 'salon-first' &&
        salon &&
        m.salonIds.length > 0 &&
        !m.salonIds.includes(salon)
      ) {
        return false;
      }
      /** Keep specialists who perform AT LEAST ONE of the picked services */
      if (
        serviceIds.length > 0 &&
        m.serviceIds.length > 0 &&
        !serviceIds.some((sid) => m.serviceIds.includes(sid))
      ) {
        return false;
      }
      if (categoryFilter !== 'All' && m.serviceIds.length > 0) {
        const matchesCat = m.serviceIds.some((sid) => {
          const sv = services.find((x) => x.id === sid);
          return sv?.category === categoryFilter;
        });
        if (!matchesCat) return false;
      }
      return true;
    });
  }, [masters, flow, salon, serviceIds, categoryFilter, services]);

  /** Salons narrowed to the chosen specialist's studios */
  const filteredSalons = useMemo(() => {
    if (!master || master === ANY_MASTER) return salons;
    const m = masters.find((x) => x.id === master);
    if (!m || m.salonIds.length === 0) return salons;
    return salons.filter((s) => m.salonIds.includes(s.id));
  }, [salons, master, masters]);

  /**
   * In the specialist-first flow the Service step only offers what the chosen
   * specialist performs. For a concrete specialist the WHOLE of their roster is
   * shown across categories — the step's own category pills browse within it,
   * and a multi-pick may span categories, so it must not be pre-narrowed by
   * `categoryFilter` (which the pick itself keeps re-syncing). "Any specialist"
   * has no roster to define the set, so it stays locked to the category they
   * were chosen through.
   */
  const filteredServices = useMemo(() => {
    if (flow !== 'specialist-first' || !master) return services;
    if (master === ANY_MASTER) {
      return categoryFilter === 'All'
        ? services
        : services.filter((s) => s.category === categoryFilter);
    }
    const m = masters.find((x) => x.id === master);
    if (!m || m.serviceIds.length === 0) return services;
    return services.filter((s) => m.serviceIds.includes(s.id));
  }, [flow, master, masters, services, categoryFilter]);

  return { categories, filteredMasters, filteredSalons, filteredServices };
};
