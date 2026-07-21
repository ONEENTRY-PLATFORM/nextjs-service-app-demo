import type { IFormAttribute } from 'oneentry/dist/forms/formsInterfaces';

import { buildSignUpBody } from '@/components/forms/buildSignUpBody';
import { isSignUpVisibleField } from '@/components/forms/isSignUpVisibleField';

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
  field('password_confirm'),
  field('name', { type: 'string' }),
  field('phone_reg', { type: 'string' }),
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

describe('buildSignUpBody', () => {
  it('routes login and password into authData only', () => {
    const body = buildSignUpBody({
      attributes: REG_FIELDS,
      values: values({
        email_reg: 'a@b.com',
        password_reg: 'Secret1!',
        password_confirm: 'Secret1!',
        name: 'Ann',
      }),
      formIdentifier: 'reg',
    });

    expect(body.authData).toEqual([
      { marker: 'email_reg', value: 'a@b.com' },
      { marker: 'password_reg', value: 'Secret1!' },
    ]);
    expect(body.formData.map((f) => f.marker)).toEqual(['name']);
  });

  it('never submits the confirm-password field', () => {
    const body = buildSignUpBody({
      attributes: REG_FIELDS,
      values: values({
        email_reg: 'a@b.com',
        password_reg: 'Secret1!',
        password_confirm: 'Secret1!',
      }),
      formIdentifier: 'reg',
    });

    const markers = [
      ...body.authData.map((f) => f.marker),
      ...body.formData.map((f) => f.marker),
    ];
    expect(markers).not.toContain('password_confirm');
  });

  it('trims values and drops whitespace-only ones', () => {
    const body = buildSignUpBody({
      attributes: REG_FIELDS,
      values: values({
        email_reg: '  a@b.com  ',
        password_reg: 'Secret1!',
        name: '   ',
      }),
      formIdentifier: 'reg',
    });

    expect(body.authData[0]).toEqual({
      marker: 'email_reg',
      value: 'a@b.com',
    });
    expect(body.formData.map((f) => f.marker)).not.toContain('name');
  });

  it('takes the notification e-mail from the flagged field', () => {
    const attributes = [
      field('login_id', { isLogin: true }),
      field('contact_email', { isNotificationEmail: true }),
    ];
    const body = buildSignUpBody({
      attributes,
      values: values({ login_id: 'user01', contact_email: 'a@b.com' }),
      formIdentifier: 'reg',
    });

    expect(body.notificationData.email).toBe('a@b.com');
  });

  it('falls back to the login field when no notification e-mail exists', () => {
    const attributes = [field('email_reg', { isLogin: true })];
    const body = buildSignUpBody({
      attributes,
      values: values({ email_reg: 'a@b.com' }),
      formIdentifier: 'reg',
    });

    expect(body.notificationData.email).toBe('a@b.com');
  });

  it('omits phoneSMS instead of sending it empty', () => {
    const attributes = [
      field('email_reg', { isLogin: true }),
      field('sms', { isNotificationPhoneSMS: true }),
    ];
    const body = buildSignUpBody({
      attributes,
      values: values({ email_reg: 'a@b.com', sms: '' }),
      formIdentifier: 'reg',
    });

    expect(body.notificationData).not.toHaveProperty('phoneSMS');
    expect(body.notificationData.phonePush).toEqual([]);
  });

  it('carries the provider form identifier through', () => {
    const body = buildSignUpBody({
      attributes: REG_FIELDS,
      values: values({ email_reg: 'a@b.com' }),
      formIdentifier: 'reg_v2',
    });

    expect(body.formIdentifier).toBe('reg_v2');
  });
});

describe('isSignUpVisibleField', () => {
  it('hides a pure notification field', () => {
    expect(
      isSignUpVisibleField(field('notify', { isNotificationEmail: true })),
    ).toBe(false);
  });

  it('shows a notification field that is also the login credential', () => {
    expect(
      isSignUpVisibleField(
        field('email_reg', { isLogin: true, isNotificationEmail: true }),
      ),
    ).toBe(true);
  });

  it('shows a notification field explicitly flagged for sign-up', () => {
    expect(
      isSignUpVisibleField(
        field('sms', { isNotificationPhoneSMS: true, isSignUpRequired: true }),
      ),
    ).toBe(true);
  });

  it('shows an ordinary profile field', () => {
    expect(isSignUpVisibleField(field('name'))).toBe(true);
  });
});
