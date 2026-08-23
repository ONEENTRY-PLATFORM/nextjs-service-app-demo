import type { IPagesEntity } from 'oneentry/types';

import { parseOfferTerms } from '@/components/layout/offers-page/parseOfferTerms';

/**
 * Build a page stub carrying an arbitrary `localizeInfos` shape.
 *
 * `htmlContent` is declared on `ILocalizeInfo`; the cast here only exists so a
 * test can attach an arbitrary payload.
 * @param   {object}       localizeInfos - Raw localizeInfos payload to attach
 * @returns {IPagesEntity}               Page stub for the helper under test
 */
const pageWith = (localizeInfos: unknown): IPagesEntity =>
  ({ localizeInfos }) as IPagesEntity;

describe('parseOfferTerms', () => {
  it('splits a <ul> into one term per <li> — the shape the admin authors', () => {
    // Verbatim shape of the live `offers` page content (2026-07-27).
    expect(
      parseOfferTerms(
        pageWith({
          htmlContent:
            '<ul><li>Valid through the end of the current month.</li>' +
            '<li>Subject to specialist availability — book ahead for weekends.</li></ul>',
        }),
      ),
    ).toEqual([
      'Valid through the end of the current month.',
      'Subject to specialist availability — book ahead for weekends.',
    ]);
  });

  it('strips nested markup and decodes entities inside items', () => {
    expect(
      parseOfferTerms(
        pageWith({
          htmlContent:
            '<ul><li><strong>Full&nbsp;package</strong> must be redeemed &amp; enjoyed.</li></ul>',
        }),
      ),
    ).toEqual(['Full package must be redeemed & enjoyed.']);
  });

  it('falls back to block-tag splitting when the content is not a list', () => {
    expect(
      parseOfferTerms(
        pageWith({
          htmlContent: '<p>First term.</p><p>Second term.</p><p></p>',
        }),
      ),
    ).toEqual(['First term.', 'Second term.']);

    expect(
      parseOfferTerms(pageWith({ htmlContent: 'First term.<br>Second term.' })),
    ).toEqual(['First term.', 'Second term.']);
  });

  it('yields [] on a missing page or blank content so the block hides', () => {
    expect(parseOfferTerms(undefined)).toEqual([]);
    expect(parseOfferTerms(pageWith(undefined))).toEqual([]);
    expect(parseOfferTerms(pageWith({ htmlContent: null }))).toEqual([]);
    expect(parseOfferTerms(pageWith({ htmlContent: '   ' }))).toEqual([]);
    expect(
      parseOfferTerms(pageWith({ htmlContent: '<ul><li> </li></ul>' })),
    ).toEqual([]);
  });
});
