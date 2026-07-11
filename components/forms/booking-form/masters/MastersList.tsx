'use client';

import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX } from 'react';
import { useEffect, useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {
  addServiceToCart,
  selectActiveItemId,
  setTabDataIds,
} from '@/app/store/reducers/CartSlice';
import useCartItem from '@/app/store/useCartItem';
import type { TabKey } from '@/app/types/global';

import NotFound from '../NotFound';
import MasterRow from './MasterRow';

/**
 * MastersList component renders a list of masters.
 * @param   {object}           props         - { masters, dict, tabKey }
 * @param   {IAdminEntity[]}   props.masters - Masters list.
 * @param   {IAttributeValues} props.dict    - Dictionary.
 * @param   {TabKey}           props.tabKey  - Tab key.
 * @returns {JSX.Element}                    JSX.Element
 */
const MastersList = ({
  masters,
  dict,
  tabKey,
}: {
  masters: IAdminEntity[];
  dict: IAttributeValues;
  tabKey: TabKey;
}): JSX.Element => {
  const dispatch = useAppDispatch();
  const activeId = useAppSelector(selectActiveItemId);

  /** Hydrated entities for the active cart row */
  const {
    salon: currentSalon,
    service: currentService,
    product: currentProduct,
    master: currentMaster,
  } = useCartItem();

  /** filter masters */
  const filteredMasters = useMemo(() => {
    const filtered = masters?.filter((master: IAdminEntity) => {
      // attributeValues schema is dynamic per OneEntry config — extract by marker.
      // `entity` values are `[{ title, value: { id, parentId, … } }]`
      // (OneEntry `IListTitleEntityValue`) — flatten to `{ id, parentId }` so the
      // filter logic below stays unchanged.
      const rawServices = master.attributeValues?.master_services?.value as
        | Array<{ value?: { id?: number | string; parentId?: number } }>
        | ''
        | undefined;
      const masterServices = Array.isArray(rawServices)
        ? rawServices.map((el) => ({
            id: el?.value?.id ?? '',
            parentId: el?.value?.parentId ?? -1,
          }))
        : rawServices;
      const rawSalon = master.attributeValues?.master_salon?.value as
        Array<{ value?: { id?: number } }> | '' | undefined;
      const masterSalon = Array.isArray(rawSalon)
        ? rawSalon.map((el) => ({ id: el?.value?.id ?? -1 }))
        : rawSalon;
      /** chek if master in Salon */
      const inSalon =
        masterSalon !== '' &&
        masterSalon?.some(
          (s) =>
            s.id === Number(currentSalon?.id) || currentSalon?.id === undefined,
        );
      /** chek if master in service */
      const inService =
        masterServices !== '' &&
        masterServices?.some(
          (s) =>
            s.parentId === Number(currentService?.id) ||
            currentService?.id === undefined,
        );
      /** chek if master in product */
      const inProduct =
        masterServices !== '' &&
        masterServices?.some((s) => {
          let id = null;
          if (Number(s.id) > 0) {
            id = s.id;
          } else {
            const t = s.id as string;
            id = Number(t.replace('p-' + s.parentId + '-', ''));
          }
          return (
            id === Number(currentProduct?.id) ||
            currentProduct?.id === undefined
          );
        });
      return inSalon && inService && inProduct;
    });

    /** Sort masters by id to ensure consistent order between server and client */
    return filtered?.sort((a, b) => a.id - b.id);
  }, [currentProduct, currentSalon, currentService, masters]);

  /** Publish filtered master IDs so SalonsList can cross-filter against them */
  useEffect(() => {
    if (filteredMasters) {
      dispatch(
        setTabDataIds({
          key: tabKey,
          value: filteredMasters.map((m) => m.id),
        }),
      );
    }
  }, [filteredMasters, tabKey, dispatch]);

  /** Masters not found */
  if (filteredMasters?.length === 0) {
    return (
      <div className="flex w-full flex-col overflow-hidden rounded-3xl bg-white px-4 text-center text-sm leading-7 text-neutral-600">
        <NotFound message="Masters not found" />
      </div>
    );
  }

  /**
   * Add master to cart
   * @param {IAdminEntity} master - Master
   */
  const addMasterToCart = (master: IAdminEntity) => {
    dispatch(
      addServiceToCart({
        id: activeId,
        masterId: master.id,
      }),
    );
  };

  /** render MastersList */
  return (
    <div className="dropdown-container flex w-full flex-col rounded-3xl bg-white">
      <fieldset id="masters_group" className="w-full p-5 md:px-14">
        {filteredMasters?.map((master) => (
          <MasterRow
            key={master.id}
            dict={dict}
            master={master}
            currentId={Number(currentMaster?.id || 0)}
            serviceCategory={currentService}
            addMasterToCart={addMasterToCart}
          />
        ))}
      </fieldset>
    </div>
  );
};

export default MastersList;
