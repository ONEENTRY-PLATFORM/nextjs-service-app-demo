'use client';

import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import { type JSX, useMemo } from 'react';

import { useGetAdminsQuery } from '@/app/api';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {
  addServiceToCart,
  selectActiveItemId,
  selectTabDataIds,
} from '@/app/store/reducers/CartSlice';
import useCartItem from '@/app/store/useCartItem';
import type { TabKey } from '@/app/types/global';

import NotFound from '../NotFound';
import SalonRow from './SalonRow';

export type TabLayoutProps = {
  salons: IPagesEntity[];
  tabKey: TabKey;
};

/**
 * SalonsList component renders a list of salons.
 * @param   {TabLayoutProps} props        - Props.
 * @param   {IPagesEntity[]} props.salons - Salons list.
 * @param   {string}         props.tabKey - Tab key.
 * @returns {JSX.Element}                 SalonsList.
 */
const SalonsList = ({ salons }: TabLayoutProps): JSX.Element => {
  const dispatch = useAppDispatch();

  /** Active cart row index, needed for dispatch payloads */
  const activeId = useAppSelector(selectActiveItemId);
  /** Hydrated entities for the active cart row */
  const {
    master: currentMaster,
    product: currentProduct,
    salon: currentSalon,
  } = useCartItem();

  /** IDs of masters currently filtered into the masters tab */
  const filteredMasterIds = useAppSelector((state) =>
    selectTabDataIds('masters', state),
  );
  /** Full admin list — look up the filtered masters by id for the cross-filter */
  const { data: allAdmins } = useGetAdminsQuery();
  const mastersData = useMemo<IAdminEntity[] | null>(() => {
    if (!filteredMasterIds || !allAdmins) {
      return null;
    }
    return allAdmins.filter((admin) => filteredMasterIds.includes(admin.id));
  }, [filteredMasterIds, allAdmins]);

  /** filter salons */
  const filteredSalons = useMemo(() => {
    if (!salons) {
      return;
    }
    const masterSalons = currentMaster?.attributeValues?.master_salon?.value as
      { id: number }[] | undefined;

    const filtered = salons?.filter((salon) => {
      /** check if salons has master */
      const inMastersSalons = mastersData?.flatMap((master: IAdminEntity) => {
        const salonValues = master.attributeValues.master_salon?.value as
          { id: number }[] | undefined;
        return salonValues?.some((v) => v.id === salon.id);
      });
      /** check if currently selected master(in cartSlice) in salon */
      const inCurrentMaster = masterSalons?.some((masterSalon) => {
        return masterSalon.id === salon.id || currentMaster?.id === undefined;
      });
      /** check if currently selected product(in cartSlice) in salon */
      const productSalons = currentProduct?.attributeValues?.salons?.value as
        { id: number }[] | undefined;
      const inProduct = productSalons?.find((s) => s.id === salon.id);
      return (
        (inCurrentMaster || inCurrentMaster === undefined) &&
        (inProduct || currentProduct?.id === undefined) &&
        (inMastersSalons || !mastersData)
      );
    });

    /** Sort salons by id to ensure consistent order between server and client */
    return filtered?.sort((a, b) => a.id - b.id);
  }, [currentMaster, currentProduct, mastersData, salons]);

  /** Salons not found */
  if (filteredSalons?.length === 0) {
    return (
      <div className="flex w-full flex-col overflow-hidden rounded-3xl bg-white px-4 text-center text-sm leading-7 text-neutral-600">
        <NotFound message={'Salons not found'} />
      </div>
    );
  }

  /**
   * add salon ToCart, reset other data if selected salon disabled
   * @param {IPagesEntity} salon    - salon entity
   * @param {boolean}      disabled - salon disabled
   */
  const addSalonToCart = (salon: IPagesEntity, disabled: boolean) => {
    dispatch(
      addServiceToCart({
        id: activeId,
        salonId: salon.id,
        ...(disabled && {
          serviceId: null,
          masterId: null,
          productId: null,
        }),
      }),
    );
  };

  /** render salons list */
  return (
    <ul className="dropdown-container flex w-full flex-col overflow-hidden rounded-3xl bg-white px-4 text-center text-sm leading-7 text-neutral-600">
      {salons?.map((salon, index) => {
        const isActive =
          filteredSalons?.some(
            (filteredSalon) => filteredSalon.id === salon.id,
          ) || false;

        return (
          <SalonRow
            key={salon.id}
            salon={salon}
            currentId={currentSalon?.id ?? 0}
            disabled={!isActive}
            addSalonToCart={addSalonToCart}
            index={index}
          />
        );
      })}
    </ul>
  );
};

export default SalonsList;
