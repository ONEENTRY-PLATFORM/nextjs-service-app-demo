import type { UnknownAction } from '@reduxjs/toolkit';

import reducer, {
  addData,
  addOrderCurrency,
  addPaymentMethod,
  addPaymentMethods,
  addProducts,
  createOrder,
  removeOrder,
} from '@/app/store/reducers/OrderSlice';

const init = (): ReturnType<typeof reducer> =>
  reducer(undefined, { type: '@@INIT' } as UnknownAction);

describe('OrderSlice', () => {
  it('starts with an empty order and the "order" formIdentifier', () => {
    const state = init();

    expect(state.order.formIdentifier).toBe('order');
    expect(state.order.formData).toEqual([]);
    expect(state.order.products).toEqual([]);
  });

  it('createOrder does not overwrite an existing order', () => {
    const state = reducer(
      init(),
      createOrder({ formIdentifier: 'other', formData: [], products: [] }),
    );

    expect(state.order.formIdentifier).toBe('order');
  });

  describe('addData', () => {
    it('pushes a new form field', () => {
      const state = reducer(
        init(),
        addData({ marker: 'name', value: 'Ivan', type: 'string' }),
      );

      expect(state.order.formData).toEqual([
        { marker: 'name', value: 'Ivan', type: 'string' },
      ]);
    });

    it('replaces an existing field by marker', () => {
      let state = reducer(
        init(),
        addData({ marker: 'name', value: 'Ivan', type: 'string' }),
      );
      state = reducer(
        state,
        addData({ marker: 'name', value: 'Anna', type: 'string' }),
      );

      expect(state.order.formData).toHaveLength(1);
      expect(state.order.formData[0]?.value).toBe('Anna');
    });
  });

  it('addProducts replaces the products array', () => {
    const products = [{ productId: 1, quantity: 2 }];
    const state = reducer(init(), addProducts(products));

    expect(state.order.products).toEqual(products);
  });

  it('addPaymentMethods sets the list only once', () => {
    let state = reducer(init(), addPaymentMethods([{ identifier: 'cash' }]));
    state = reducer(state, addPaymentMethods([{ identifier: 'stripe' }]));

    expect(state.paymentMethods).toEqual([{ identifier: 'cash' }]);
  });

  it('addPaymentMethod and addOrderCurrency update the order', () => {
    let state = reducer(init(), addPaymentMethod('stripe'));
    state = reducer(state, addOrderCurrency('USD'));

    expect(state.order.paymentAccountIdentifier).toBe('stripe');
    expect(state.currency).toBe('USD');
  });

  it('removeOrder resets the order to its initial shape', () => {
    let state = reducer(
      init(),
      addData({ marker: 'name', value: 'Ivan', type: 'string' }),
    );
    state = reducer(state, removeOrder());

    expect(state.order.formData).toEqual([]);
    expect(state.order.formIdentifier).toBe('order');
  });
});
