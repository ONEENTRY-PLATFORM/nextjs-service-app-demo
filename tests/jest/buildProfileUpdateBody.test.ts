import type { IFormAttribute } from 'oneentry/types';

import { buildProfileUpdateBody } from '@/components/forms/buildProfileUpdateBody';

/**
 * field — a minimal CMS form attribute for the tests.
 * @param   {string}         marker  - Field marker
 * @param   {object}         [flags] - CMS flags and type to set on the field
 * @returns {IFormAttribute}         Form attribute
 */
const field = (
  marker: string,
  flags: Partial<IFormAttribute> = {},
): IFormAttribute =>
  ({ marker, type: 'string', position: 0, ...flags }) as IFormAttribute;

/** The shape the `reg` form has in the CMS today. */
const REG_FIELDS: IFormAttribute[] = [
  field('email_reg', { isLogin: true, isNotificationEmail: true }),
  field('password_reg', { isPassword: true }),
  field('password_confirm', { isPassword: true }),
  field('name'),
  field('phone_reg'),
];

/**
 * values — live form values in the shape `FormFieldsSlice` holds them.
 * @param   {Record<string, string>} entries - Marker → raw value
 * @returns {Record<string, object>}         Field state map
 */
const values = (
  entries: Record<string, string>,
): Record<string, { value: string; valid: boolean }> =>
  Object.fromEntries(
    Object.entries(entries).map(([k, v]) => [k, { value: v, valid: true }]),
  );

/**
 * build — call the subject with the standard `reg` fields and given values.
 * @param   {Record<string, string>} entries - Live values
 * @param   {object}                 [extra] - Overrides for the non-value args
 * @returns {object}                         The assembled body
 */
const build = (
  entries: Record<string, string>,
  extra: Partial<Parameters<typeof buildProfileUpdateBody>[0]> = {},
) =>
  buildProfileUpdateBody({
    attributes: REG_FIELDS,
    values: values(entries),
    formIdentifier: 'reg',
    email: 'user@example.com',
    phoneSMS: '',
    ...extra,
  });

describe('buildProfileUpdateBody', () => {
  it('routes non-credential fields into formData with their type', () => {
    const body = build({ name: 'Anna', phone_reg: '+971500000000' });

    expect(body.formData).toEqual([
      { marker: 'name', value: 'Anna', type: 'string' },
      { marker: 'phone_reg', value: '+971500000000', type: 'string' },
    ]);
  });

  it('keeps the login e-mail OUT of formData', () => {
    const markers = (
      build({ email_reg: 'x@y.z', name: 'Anna' }).formData as Array<{
        marker: string;
      }>
    ).map((f) => f.marker);
    expect(markers).not.toContain('email_reg');
  });

  it('drops empty values (FormInput seeds Redux with "")', () => {
    const markers = (
      build({ name: 'Anna', phone_reg: '' }).formData as Array<{
        marker: string;
      }>
    ).map((f) => f.marker);
    expect(markers).toEqual(['name']);
  });

  it('omits authData entirely when no new password was typed', () => {
    expect(build({ name: 'Anna' }).authData).toBeUndefined();
  });

  it('sends the password as authData WITHOUT a type key', () => {
    expect(build({ password_reg: 'Secret123!' }).authData).toEqual([
      { marker: 'password_reg', value: 'Secret123!' },
    ]);
  });

  it('always sends notificationData with the passed-in e-mail', () => {
    expect(build({ name: 'Anna' }).notificationData).toEqual({
      email: 'user@example.com',
      phonePush: [],
      phoneSMS: '',
    });
  });

  it('carries a non-empty phoneSMS through', () => {
    expect(
      build({}, { phoneSMS: '+971500000000' }).notificationData?.phoneSMS,
    ).toBe('+971500000000');
  });

  it('echoes the state back when present, omits it otherwise', () => {
    expect(build({}, { state: { cart: { 1: 2 } } }).state).toEqual({
      cart: { 1: 2 },
    });
    expect(build({}).state).toBeUndefined();
  });

  it('keeps the given formIdentifier', () => {
    expect(build({}, { formIdentifier: 'reg' }).formIdentifier).toBe('reg');
  });
});
