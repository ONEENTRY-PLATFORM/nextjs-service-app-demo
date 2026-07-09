'use client';

import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { JSX } from 'react';
import { useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {
  addServiceToCart,
  selectActiveItemId,
} from '@/app/store/reducers/CartSlice';
import useCartItem from '@/app/store/useCartItem';
import type { TabKey } from '@/app/types/global';

import NotFound from '../NotFound';
import ServicesRow from './ServiceRow';

/**
 * Services list Component.
 * @param   {object}         props          - Component props.
 * @param   {string}         props.tabKey   - Tab key.
 * @param   {IPagesEntity[]} props.services - Services.
 * @param   {IPagesEntity[]} props.salons   - Salons.
 * @returns {JSX.Element}                   Rendered list of ServicesRow components or NotFound.
 */
const ServicesList = ({
  services,
}: {
  tabKey: TabKey;
  services: IPagesEntity[];
  salons: IPagesEntity[];
}): JSX.Element => {
  const dispatch = useAppDispatch();

  /** Active cart row index, used as `id` in dispatch payloads */
  const activeId = useAppSelector(selectActiveItemId);
  /** Hydrated entities for the active cart row */
  const {
    salon: salonData,
    master: masterData,
    service: currentService,
  } = useCartItem();

  /** Filter services based on salon and master availability */
  const filteredServices = useMemo(() => {
    /** Extract service IDs that are available for the current master */
    const masterServices = masterData?.attributeValues?.services?.value as
      { id: number }[] | undefined;
    const inMasterServices = masterServices
      ?.filter((m) => m.id > 0)
      .map((s) => s.id);

    const filtered = services?.filter((service) => {
      const salonServices = salonData?.attributeValues?.services?.value as
        { id: number }[] | undefined;
      const inSalon =
        salonServices?.some((s) => service.id === s.id) ||
        salonData?.id === undefined;

      const inMaster =
        inMasterServices && inMasterServices.length > 0
          ? inMasterServices.some((sId: number) => sId === service.id)
          : true;

      return inSalon && inMaster;
    });

    /** Sort services by id to ensure consistent order between server and client */
    return filtered?.sort((a, b) => a.id - b.id);
  }, [services, salonData, masterData]);

  /** Render not found message when no services are available */
  if (filteredServices?.length === 0) {
    return (
      <div className="flex w-full flex-col overflow-hidden rounded-3xl bg-white px-4 text-center text-sm leading-7 text-neutral-600">
        <NotFound message="Services not found" />
      </div>
    );
  }

  /**
   * Add service to cart and reset master and product
   * @param {IPagesEntity} service  - Service to add to cart
   * @param {boolean}      disabled - Whether the service is disabled
   * @param {IAdminEntity} master   - Master to add to cart
   */
  const addCategoryToCart = (
    service: IPagesEntity,
    disabled: boolean,
    master: IAdminEntity,
  ) => {
    dispatch(
      addServiceToCart({
        id: activeId,
        serviceId: service.id,
        masterId: disabled ? null : (master?.id ?? null),
        productId: null,
        salonId: null,
      }),
    );
  };

  /** Render services list with service rows */
  return (
    <ul className="dropdown-container flex w-full flex-col overflow-hidden rounded-3xl bg-white px-4 text-center text-sm leading-7 text-neutral-600">
      {services?.map((service: IPagesEntity) => {
        /** Check if service is active (available for current salon/master) */
        const isActive =
          filteredServices?.some(
            (filteredService) => filteredService.id === service.id,
          ) || false;

        /** Currently selected service id for row highlighting */
        const currentId = currentService?.id;

        /** Render service row for each service */
        return (
          <ServicesRow
            key={service.id}
            service={service}
            {...(currentId !== undefined && { currentId })}
            disabled={!isActive}
            addCategoryToCart={addCategoryToCart}
            master={masterData as IAdminEntity}
          />
        );
      })}
    </ul>
  );
};

export default ServicesList;
