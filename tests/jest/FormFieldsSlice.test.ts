import type { UnknownAction } from '@reduxjs/toolkit';

import reducer, { addField } from '@/app/store/reducers/FormFieldsSlice';

const init = (): ReturnType<typeof reducer> =>
  reducer(undefined, { type: '@@INIT' } as UnknownAction);

describe('FormFieldsSlice', () => {
  it('starts with no fields', () => {
    expect(init().fields).toEqual({});
  });

  it('addField stores a field by its marker', () => {
    const state = reducer(
      init(),
      addField({ email: { value: 'a@b.c', valid: true } }),
    );

    expect(state.fields.email).toEqual({ value: 'a@b.c', valid: true });
  });

  it('addField overwrites an existing field with the same marker', () => {
    let state = reducer(
      init(),
      addField({ email: { value: 'a@b.c', valid: true } }),
    );
    state = reducer(
      state,
      addField({ email: { value: 'broken', valid: false } }),
    );

    expect(state.fields.email).toEqual({ value: 'broken', valid: false });
  });

  it('ignores an empty payload', () => {
    const state = reducer(init(), addField({}));

    expect(state.fields).toEqual({});
  });
});
