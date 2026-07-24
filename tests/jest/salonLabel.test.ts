import { salonLabel } from '@/components/utils/salonLabel';

describe('salonLabel', () => {
  it('drops the brand prefix the CMS titles carry', () => {
    expect(salonLabel('Thalia Downtown')).toBe('Downtown');
    expect(salonLabel('Thalia Marina')).toBe('Marina');
    expect(salonLabel('Thalia JBR')).toBe('JBR');
  });

  it('ignores the prefix casing', () => {
    expect(salonLabel('THALIA Downtown')).toBe('Downtown');
    expect(salonLabel('thalia  Marina')).toBe('Marina');
  });

  /** Only a leading prefix comes off — a salon actually named after the brand keeps it. */
  it('leaves the brand alone when it is not a prefix', () => {
    expect(salonLabel('Downtown Thalia')).toBe('Downtown Thalia');
    expect(salonLabel('Thalialand')).toBe('Thalialand');
  });

  it('returns an empty string for missing titles', () => {
    expect(salonLabel(undefined)).toBe('');
    expect(salonLabel('')).toBe('');
  });

  /**
   * The prefix needs a separator, so a salon titled exactly `Thalia` keeps its
   * name instead of collapsing to an empty suffix and losing the role line.
   */
  it('keeps a bare brand title rather than erasing it', () => {
    expect(salonLabel('Thalia')).toBe('Thalia');
  });
});
