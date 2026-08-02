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

/**
 * A CMS form field as the contact card reads it. The card keeps no field list
 * of its own: values are keyed by these markers, so the form definition in the
 * admin is the single source of truth for what the visitor fills in.
 */
export type ContactFormField = {
  marker: string;
  type: string;
};
