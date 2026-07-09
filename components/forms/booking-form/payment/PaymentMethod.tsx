import gsap from 'gsap';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IAccountsEntity } from 'oneentry/dist/payments/paymentsInterfaces';
import type { JSX } from 'react';

import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { setTabsState } from '@/app/store/reducers/CartSlice';
import { addPaymentMethod } from '@/app/store/reducers/OrderSlice';
import useCartItem from '@/app/store/useCartItem';

import BookingCard from './BookingCard';
import ConfirmOrderButton from './ConfirmOrderButton';

/**
 * Payment method component that allows users to select a payment method.
 *
 * This component renders a selectable card for a payment method, showing its title and description.
 * When selected, it displays additional booking information and a confirmation button.
 * It also handles validation of required booking fields and displays appropriate error messages.
 * @param   {object}           props         - Component properties
 * @param   {IAccountsEntity}  props.account - Payment account information from OneEntry, containing details like identifier and localized title
 * @param   {IAttributeValues} props.dict    - Dictionary object containing localized text values for UI elements
 * @returns {JSX.Element}                    Rendered payment method selector component with selection state, booking details, and validation
 */
const PaymentMethod = ({
  account,
  dict,
}: {
  account: IAccountsEntity;
  dict: IAttributeValues;
}): JSX.Element => {
  /** Redux dispatch function for updating application state */
  const dispatch = useAppDispatch();

  /** Current order data from Redux store, including selected payment method */
  const orderData = useAppSelector((state) => state.orderReducer.order);

  /** Determines if this payment method is currently selected/active */
  const isActive = orderData?.paymentAccountIdentifier === account.identifier;

  /** Hydrate the active cart row's entities */
  const { item } = useCartItem();
  const salonId = item?.salonId;
  const serviceId = item?.serviceId;
  const masterId = item?.masterId;
  const productId = item?.productId;
  const date = item?.date;

  /**
   * Validation flag indicating if all required booking fields are filled.
   * Returns true only when salon, service, master, product and date are all selected.
   */
  const isValid = Boolean(
    salonId && serviceId && masterId && productId && date,
  );

  /**
   * Handles toggling the payment method selection state.
   * If already active, deselects by clearing the payment method identifier.
   * If inactive, selects this payment method by setting its identifier in the store.
   */
  const handleTogglePaymentMethod = () => {
    if (isActive) {
      dispatch(addPaymentMethod(''));
    } else {
      dispatch(addPaymentMethod(account.identifier));
    }
  };

  /**
   * Array of validation errors for incomplete booking fields.
   * Each error contains a title message and corresponding navigation link
   * to help users locate and complete missing information.
   */
  const errors: {
    title: string;
    link: string;
  }[] = [];

  if (!isValid) {
    if (!salonId) {
      errors.push({
        title: 'Select salon',
        link: 'salons',
      });
    }
    if (!serviceId) {
      errors.push({
        title: 'Select service',
        link: 'services',
      });
    }
    if (!productId) {
      errors.push({
        title: 'Select product',
        link: 'products',
      });
    }
    if (!masterId) {
      errors.push({
        title: 'Select master',
        link: 'masters',
      });
    }
    if (!date) {
      errors.push({
        title: 'Select date',
        link: 'calendar',
      });
    }
  }

  /* Renders the payment method component with */
  return (
    <div
      className={`relative mb-4 w-full flex-row items-center justify-between overflow-hidden rounded-3xl bg-white p-4 text-slate-700 ${
        isActive ? 'min-h-16' : 'min-h-8 cursor-pointer'
      }`}
      onClick={() =>
        !isActive && dispatch(addPaymentMethod(account.identifier))
      }
    >
      {/* Description */}
      <div className="flex-col">
        <h2 className="text-lg font-bold">{account?.localizeInfos?.title}</h2>
        <p className="mb-4 text-base">
          Payment description {account?.localizeInfos?.title}
        </p>
        <button
          onClick={handleTogglePaymentMethod}
          className="absolute right-4 bottom-4 size-6 rounded-full bg-slate-100 text-center"
        >
          {isActive ? '-' : '+'}
        </button>
      </div>
      {/*
       * Expanded content section shown when payment method is active
       * Contains booking details and validation feedback
       */}
      {isActive && (
        <div id="cartData" className="w-full">
          <BookingCard dict={dict} />
          {errors.map((error, i) => {
            return (
              <button
                key={i}
                onClick={() => {
                  // Define valid tab keys for type safety
                  const validTabKeys = [
                    'salons',
                    'services',
                    'products',
                    'masters',
                    'calendar',
                    'signin',
                    'payment',
                  ] as const;

                  // Create type from valid keys for proper type checking
                  type TabKeyType = (typeof validTabKeys)[number];

                  // Only process click if the error link is a valid tab key
                  if (validTabKeys.includes(error.link as TabKeyType)) {
                    // Smooth scroll to the relevant section with offset
                    gsap.to(window, {
                      duration: 0.5,
                      scrollTo: { y: '#' + error.link, offsetY: 200 },
                    });
                    // Update tabs state to show the relevant section
                    dispatch(
                      setTabsState({
                        key: error.link as TabKeyType,
                        value: true,
                      }),
                    );
                  }
                }}
                className="flex min-w-full text-red-500"
              >
                {error.title}
              </button>
            );
          })}
          {/*
           * Container for action buttons, primarily the confirm order button
           * Includes responsive design classes for different screen sizes
           */}
          <div className="flex justify-between gap-4 max-md:mb-8 max-sm:flex-wrap max-sm:gap-0">
            <ConfirmOrderButton
              dict={dict}
              account={account}
              isValid={isValid}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethod;
