import { expectCmsArray } from '@/app/api/utils/expectCmsArray';

describe('expectCmsArray', () => {
  it('passes a real array through untouched', () => {
    const pages = [{ id: 1 }, { id: 2 }];
    expect(expectCmsArray(pages, 'getChildPagesByParentUrl')).toBe(pages);
  });

  it('accepts an empty array — a childless parent is not a failure', () => {
    expect(expectCmsArray([], 'getChildPagesByParentUrl')).toEqual([]);
  });

  /**
   * The shape that caused three 500s in the 2026-07-23 e2e run: the SDK runs in
   * shell mode, so a dropped connection or an empty 200 body resolves to a bare
   * `{}` that `isError` waves through as a success.
   */
  it('throws on the bare object the SDK returns for a swallowed failure', () => {
    expect(() => expectCmsArray({}, 'getChildPagesByParentUrl')).toThrow(
      /non-array payload \(object\)/,
    );
  });

  it('throws on the empty string an unset attribute can carry', () => {
    expect(() => expectCmsArray('', 'getBlocksByPageUrl')).toThrow(
      /non-array payload \(string\)/,
    );
  });

  it('throws on null without reporting it as an object', () => {
    expect(() => expectCmsArray(null, 'getAdminsInfo')).toThrow(
      /non-array payload \(null\)/,
    );
  });

  it('names the wrapper in the message so the log points at a call site', () => {
    expect(() => expectCmsArray(undefined, 'getAdminsInfo')).toThrow(
      /^getAdminsInfo:/,
    );
  });
});
