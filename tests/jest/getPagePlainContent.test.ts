import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';

import { getPagePlainContent } from '@/app/utils/getPagePlainContent';

/**
 * Build a page stub carrying an arbitrary `localizeInfos` shape.
 *
 * `plainContent` is declared on `ILocalizeInfo` since SDK 1.0.158; the cast
 * here only exists so a test can attach an arbitrary payload — including the
 * `plainValue` a page never actually sends.
 * @param   {object}       localizeInfos - Raw localizeInfos payload to attach
 * @returns {IPagesEntity}               Page stub for the helper under test
 */
const pageWith = (localizeInfos: unknown): IPagesEntity =>
  ({ localizeInfos }) as IPagesEntity;

describe('getPagePlainContent', () => {
  it('reads plainContent — the field pages actually send', () => {
    expect(
      getPagePlainContent(pageWith({ plainContent: 'About the salon' })),
    ).toBe('About the salon');
  });

  it('ignores plainValue, which the SDK type declares but pages never send', () => {
    // Guards the original defect: reading `plainValue` type-checks and always
    // yields undefined, so `description` silently fell back to the title.
    expect(
      getPagePlainContent(pageWith({ plainValue: 'never sent' })),
    ).toBeUndefined();
  });

  it('returns undefined for empty/whitespace so callers can chain ?? title', () => {
    expect(getPagePlainContent(pageWith({ plainContent: '' }))).toBeUndefined();
    expect(
      getPagePlainContent(pageWith({ plainContent: '   ' })),
    ).toBeUndefined();
  });

  it('trims surrounding whitespace', () => {
    expect(
      getPagePlainContent(pageWith({ plainContent: '  Hair care  ' })),
    ).toBe('Hair care');
  });

  it('degrades to undefined on a missing page, localizeInfos or null value', () => {
    expect(getPagePlainContent(undefined)).toBeUndefined();
    expect(getPagePlainContent(pageWith(undefined))).toBeUndefined();
    expect(
      getPagePlainContent(pageWith({ plainContent: null })),
    ).toBeUndefined();
  });
});
