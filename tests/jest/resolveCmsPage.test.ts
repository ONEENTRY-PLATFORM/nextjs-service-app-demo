import { getPageByUrl } from '@/app/api/server/pages/getPageByUrl';
import { resolveCmsPage } from '@/app/utils/resolveCmsPage';

jest.mock('@/app/api/server/pages/getPageByUrl', () => ({
  getPageByUrl: jest.fn(),
}));

const mocked = getPageByUrl as jest.MockedFunction<typeof getPageByUrl>;

describe('resolveCmsPage', () => {
  beforeEach(() => mocked.mockReset());

  it('reports ok with the page when the CMS answers', async () => {
    const page = { id: 2, pageUrl: 'services' };
    mocked.mockResolvedValue({ isError: false, page } as never);

    expect(await resolveCmsPage('services')).toEqual({ status: 'ok', page });
  });

  /**
   * Verified against the live API: an unknown marker answers
   * `IError { statusCode: 404, message: 'Page not found' }`, which `fetchCmsData`
   * treats as a stable result rather than throwing.
   */
  it('reports missing only for a real 404', async () => {
    mocked.mockResolvedValue({
      isError: true,
      error: { statusCode: 404, message: 'Page not found' },
    } as never);

    expect(await resolveCmsPage('no-such-page')).toEqual({ status: 'missing' });
  });

  it.each([
    ['a 500 from the CMS', { statusCode: 500, message: 'Server error' }],
    ['a 429 rate limit', { statusCode: 429, message: 'Too many requests' }],
    ['a thrown timeout with no status', { message: 'timeout' }],
    ['no error object at all', undefined],
  ])('reports unavailable for %s', async (_label, error) => {
    mocked.mockResolvedValue({ isError: true, error } as never);

    expect(await resolveCmsPage('services')).toEqual({
      status: 'unavailable',
    });
  });

  it('treats an errorless empty answer as unavailable, not missing', async () => {
    mocked.mockResolvedValue({ isError: false } as never);

    expect(await resolveCmsPage('services')).toEqual({
      status: 'unavailable',
    });
  });
});
