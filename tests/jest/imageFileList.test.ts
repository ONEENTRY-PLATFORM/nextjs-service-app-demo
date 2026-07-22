import { imageFileList } from '@/components/utils/imageFileList';

const PHOTOS = [
  { downloadLink: 'https://cdn/1.jpg', defaultPreview: 'default' },
  { downloadLink: 'https://cdn/2.jpg' },
];

describe('imageFileList', () => {
  it('returns a filled group of images unchanged', () => {
    expect(imageFileList(PHOTOS)).toEqual(PHOTOS);
  });

  it('returns [] for an empty group', () => {
    expect(imageFileList([])).toEqual([]);
  });

  /**
   * The regression this helper exists for: an unset multi-value attribute comes
   * back as the empty string, which `?? []` lets through — the portfolio grid
   * then threw `''.map is not a function`.
   */
  it('returns [] for the empty string an unset attribute carries', () => {
    expect(imageFileList('')).toEqual([]);
  });

  it('returns [] for undefined and null', () => {
    expect(imageFileList(undefined)).toEqual([]);
    expect(imageFileList(null)).toEqual([]);
  });

  it('returns [] for an object rather than exposing its keys', () => {
    expect(imageFileList({ downloadLink: 'https://cdn/1.jpg' })).toEqual([]);
  });
});
