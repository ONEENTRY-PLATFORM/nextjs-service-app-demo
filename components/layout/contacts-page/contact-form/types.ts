/**
 * Local field keys of the "Write to us" card — matched against the CMS form
 * attribute markers. The message field is keyed `contact_text` to mirror its
 * CMS marker (the form uses `contact_text`, not `message`), so the answers are
 * mapped by marker without a translation table.
 */
export type FieldKey = 'name' | 'phone' | 'email' | 'contact_text';

/**
 * One serialized answer for `postFormsData`. The `value` shape depends on the
 * field type: a plain string, a `text` array, or the `spam` captcha object
 * `{ event: { token, siteKey } }` — hence the widened union.
 */
export type ContactFormAnswer = {
  marker: string;
  type: string;
  value:
    | string
    | { plainValue: string; params: { editorMode: string } }[]
    | { event: { token: string; siteKey: string } };
};

/** A CMS form field as the contact card reads it. */
export type ContactFormField = {
  marker: string;
  type: string;
};

/** The empty contact form — also what a successful submit resets to. */
export const EMPTY_CONTACT_FIELDS: Record<FieldKey, string> = {
  name: '',
  phone: '',
  email: '',
  contact_text: '',
};
