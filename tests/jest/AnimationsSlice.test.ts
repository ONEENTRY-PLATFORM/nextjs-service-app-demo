import type { UnknownAction } from '@reduxjs/toolkit';

import reducer, {
  getReadyState,
  setReadyState,
} from '@/app/store/reducers/AnimationsSlice';

const init = (): ReturnType<typeof reducer> =>
  reducer(undefined, { type: '@@INIT' } as UnknownAction);

describe('AnimationsSlice', () => {
  it('starts with animations not ready', () => {
    expect(init().readyState).toBe(false);
  });

  it('setReadyState flips the ready flag both ways', () => {
    let state = reducer(init(), setReadyState({ value: true }));
    expect(state.readyState).toBe(true);

    state = reducer(state, setReadyState({ value: false }));
    expect(state.readyState).toBe(false);
  });

  it('getReadyState selector returns the animations slice', () => {
    const state = reducer(init(), setReadyState({ value: true }));

    expect(getReadyState({ animationsReducer: state })).toBe(state);
  });
});
