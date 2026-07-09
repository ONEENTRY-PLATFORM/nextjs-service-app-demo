'use client';

import { useTransitionRouter } from 'next-transition-router';
import { useState } from 'react';

import { getApi } from '@/app/api';
import { isError } from '@/app/api';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { removeAllServices } from '@/app/store/reducers/CartSlice';
import { removeOrder } from '@/app/store/reducers/OrderSlice';

/**
 * Custom hook to handle order creation and payment session
 *
 * This hook provides functionality for creating orders and managing payment sessions.
 * It handles both cash payments and online payments through the OneEntry API.
 * @returns {object} Object containing order-related functions and state
 */

export const useCreateOrder = (): {
  onConfirmOrder: () => Promise<void>;
  createSession: (id: number) => Promise<string | undefined>;
  isLoading: boolean;
  error: string;
} => {
  const router = useTransitionRouter();
  const dispatch = useAppDispatch();
  const order = useAppSelector((state) => state.orderReducer.order);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  /**
   * Create payment session with Payments API
   *
   * This function creates a payment session for the given order ID.
   * It handles both cash payments (redirecting to profile) and online payments (redirecting to payment URL).
   * @param   {number}          id - Order ID for creating a session
   * @returns {Promise<string>}    Promise resolving to payment state marker or void
   */
  const createSession = async (id: number): Promise<string> => {
    if (!id) return 'payment_error';

    setIsLoading(true);

    try {
      if (order?.paymentAccountIdentifier === 'cash') {
        router.push('/profile');
        return 'payment_success';
      }
      const session = await getApi().Payments.createSession(id, 'session');
      if (isError(session)) {
        setError(session.message);
        return 'payment_error';
      }
      if (session.paymentUrl) {
        router.push(session.paymentUrl);
        return 'payment_method';
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
    return '';
  };

  /**
   * Confirm order and create it using Orders API
   *
   * This function prepares the order data, creates the order through the API,
   * clears the cart and order state, and initiates the payment process.
   * @returns {Promise<void>} Promise resolving when the order is confirmed
   */
  const onConfirmOrder = async (): Promise<void> => {
    if (!order?.formIdentifier || !order?.paymentAccountIdentifier) return;

    setIsLoading(true);

    try {
      /** Prepare order data */
      const orderFormData = order.formData.map(({ marker, type, value }) => ({
        marker,
        type,
        value,
      }));

      /** Create order with Orders API */
      const createdOrder = await getApi().Orders.createOrder('orders', {
        ...order,
        formData: orderFormData,
        formIdentifier: order.formIdentifier,
        paymentAccountIdentifier: order.paymentAccountIdentifier,
      });

      if (isError(createdOrder)) {
        setError(createdOrder.message);
        return;
      }

      const { id, paymentAccountIdentifier } = createdOrder;

      /** removeAllServices from cart */
      dispatch(removeAllServices());

      /** Remove order from store */
      dispatch(removeOrder());

      /** Handle payment session based on payment method */
      if (paymentAccountIdentifier !== 'cash') {
        await createSession(id);
      } else {
        router.push('/profile');
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    onConfirmOrder,
    createSession,
    isLoading,
    error,
  };
};
