import type { IError } from 'oneentry/types';

import { expectSdkEntity } from '@/app/api/utils/expectSdkEntity';

describe('expectSdkEntity', () => {
  it('passes a real entity through', () => {
    const entity = { id: 7, title: 'Hair colouring' };

    expect(expectSdkEntity(entity, 'Products.getProductById')).toEqual({
      data: entity,
    });
  });

  it('forwards an IError from the API unchanged', () => {
    const error: IError = {
      statusCode: 404,
      message: 'Not found',
      pageData: null,
      timestamp: '2026-08-23T00:00:00.000Z',
    };

    expect(expectSdkEntity(error, 'Pages.getPageById')).toEqual({ error });
  });

  it('rejects the flattened {} shell mode fabricates on a network failure', () => {
    const result = expectSdkEntity({}, 'Users.getUser');

    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error.statusCode).toBe(502);
      expect(result.error.message).toContain('Users.getUser');
      expect(result.error.message).toContain('"id"');
    }
  });

  it.each([
    ['an array', [{ id: 1 }]],
    ['null', null],
    ['a string', 'oops'],
    ['undefined', undefined],
  ])('rejects %s', (_label, payload) => {
    expect('error' in expectSdkEntity(payload, 'Blocks.getBlockByMarker')).toBe(
      true,
    );
  });

  it('honours a custom required key (list containers carry `items`)', () => {
    const container = { items: [], total: 0 };

    expect(expectSdkEntity(container, 'Products.getProducts', 'items')).toEqual(
      { data: container },
    );
    expect(
      'error' in expectSdkEntity({ id: 1 }, 'Products.getProducts', 'items'),
    ).toBe(true);
  });
});
