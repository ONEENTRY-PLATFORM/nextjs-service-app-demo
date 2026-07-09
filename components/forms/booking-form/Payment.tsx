'use client';

import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX } from 'react';
import { useContext, useEffect, useMemo } from 'react';

import { useGetAccountsQuery } from '@/app/api';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { AuthContext } from '@/app/store/providers/AuthContext';
import {
  selectActiveItemId,
  selectCartData,
} from '@/app/store/reducers/CartSlice';
import {
  addData,
  addProducts,
  createOrder,
} from '@/app/store/reducers/OrderSlice';
import AuthError from '@/components/pages/AuthError';
import SpinnerLoader from '@/components/shared/SpinnerLoader';

import DropdownAnimations from './animations/DropdownAnimations';
import DropdownButton from './DropdownButton';
import PaymentMethod from './payment/PaymentMethod';

/**
 * Payment.
 * @param   {object}           props      - props.
 * @param   {IAttributeValues} props.dict - dictionary from server api.
 * @returns {JSX.Element}                 JSX.Element.
 */
const Payment = ({ dict }: { dict: IAttributeValues }): JSX.Element => {
  const tabKey = 'payment';
  const dispatch = useAppDispatch();
  const { isAuth } = useContext(AuthContext);

  /** Active cart row index */
  const activeId = useAppSelector(selectActiveItemId);

  /** Payment methods in orderSlice */
  const paymentMethods = useAppSelector(
    (state) => state.orderReducer.paymentMethods,
  );

  /** Normalized cart items (IDs only) */
  const cartData = useAppSelector(selectCartData);

  /** Products in orderSlice */
  const productsInOrder = useMemo(() => {
    return cartData
      .filter((item) => item.productId !== undefined)
      .map((item) => ({
        productId: item.productId as number,
        quantity: 1,
      }));
  }, [cartData]);

  /** Get all payment accounts as an array */
  const { data, error, isLoading } = useGetAccountsQuery({});

  /** Allowed payment methods */
  const whitelistMethods = useMemo(() => {
    if (data) {
      return data.filter((method) => {
        const index = paymentMethods?.findIndex(
          (whitelistMethod) => method.identifier === whitelistMethod.identifier,
        );
        if (index !== -1) {
          return method;
        }
        return;
      });
    }
    return [];
  }, [data, paymentMethods]);

  /** Create order in orderSlice on init component */
  useEffect(() => {
    const data = {
      formData: [],
      products: productsInOrder,
      formIdentifier: 'order',
      paymentAccountIdentifier: 'cash',
    };
    dispatch(createOrder(data));
  }, [dispatch, productsInOrder]);

  /** add products to orderSlice */
  useEffect(() => {
    if (productsInOrder) {
      dispatch(addProducts(productsInOrder));
    }
  }, [dispatch, productsInOrder]);

  /** add data to orderSlice for create order on change cartData */
  useEffect(() => {
    const activeItem = cartData.find((row) => row.id === activeId);
    if (!activeItem) {
      return;
    }
    const { masterId, salonId, interval } = activeItem;

    /** add master to orderSlice */
    if (masterId !== undefined) {
      dispatch(
        addData({
          marker: 'master',
          type: 'list',
          value: [masterId.toString()],
        }),
      );
    }

    /** add salon to orderSlice */
    if (salonId !== undefined) {
      dispatch(
        addData({
          marker: 'order_salon',
          type: 'entity',
          value: [salonId.toString()],
        }),
      );
    }

    /** add interval to orderSlice */
    if (interval) {
      dispatch(
        addData({
          marker: 'interval',
          type: 'timeInterval',
          value: [interval],
        }),
      );
    }
  }, [dispatch, activeId, cartData]);

  /** Auth Error */
  if (error) {
    return <AuthError dict={dict} />;
  }

  /** SpinnerLoader */
  if ((cartData.length < 1 && isLoading) || isLoading) {
    return <SpinnerLoader />;
  }

  return isAuth ? (
    <DropdownAnimations
      id={tabKey}
      className="mb-5 flex w-full flex-col gap-4"
      index={6}
      tabKey={tabKey}
    >
      <DropdownButton title={'Payment'} tabKey={tabKey} />
      <div className="dropdown-container w-full">
        {whitelistMethods.map((item, index) => {
          return <PaymentMethod key={index} account={item} dict={dict} />;
        })}
      </div>
    </DropdownAnimations>
  ) : (
    <></>
  );
};

export default Payment;
