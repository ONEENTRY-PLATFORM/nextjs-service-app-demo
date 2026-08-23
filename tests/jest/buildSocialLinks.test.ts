import type { IAttributeValues } from 'oneentry/types';

import { socialData } from '@/components/data/socialData';
import { buildSocialLinks } from '@/components/utils/buildSocialLinks';

/**
 * Build a dictionary stub holding only the given markers.
 * @param   {Record<string, unknown>} values - Marker → raw attribute value
 * @returns {IAttributeValues}               Dictionary stub
 */
const dict = (values: Record<string, unknown>): IAttributeValues =>
  Object.fromEntries(
    Object.entries(values).map(([marker, value]) => [marker, { value }]),
  ) as unknown as IAttributeValues;

describe('buildSocialLinks', () => {
  it('takes each URL from its `social_{icon}_url` marker', () => {
    const links = buildSocialLinks(
      dict({
        social_instagram_url: 'https://instagram.com/thalia',
        social_facebook_url: 'https://facebook.com/thalia',
        social_twitter_url: 'https://x.com/thalia',
      }),
    );
    expect(links.map(({ link }) => link)).toEqual([
      'https://instagram.com/thalia',
      'https://facebook.com/thalia',
      'https://x.com/thalia',
    ]);
  });

  it('keeps the network list and its icons untouched', () => {
    const links = buildSocialLinks(dict({}));
    expect(links.map(({ title, icon }) => ({ title, icon }))).toEqual(
      socialData.map(({ title, icon }) => ({ title, icon })),
    );
  });

  /** The dictionary is optional — the buttons must still render. */
  it('falls back to the local URL when the block is unavailable', () => {
    expect(buildSocialLinks(undefined)).toEqual(socialData);
  });

  /**
   * An unfilled attribute comes back from the CMS as an empty array, and an
   * empty string is not a usable href either — both fall back.
   */
  it.each([
    ['an empty array', []],
    ['an empty string', ''],
    ['a number', 42],
  ])('falls back on a non-string marker (%s)', (_label, value) => {
    const [instagram] = buildSocialLinks(dict({ social_instagram_url: value }));
    expect(instagram?.link).toBe(socialData[0]?.link);
  });
});
