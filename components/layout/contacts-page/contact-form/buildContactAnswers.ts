import type { ContactFormAnswer, ContactFormField } from './types';

/**
 * buildContactAnswers — maps the card's local values onto the CMS form
 * attributes by marker.
 *
 * Fields the visitor left blank are skipped: an empty string must not be
 * submitted as an answer. A `text` attribute carries exactly ONE value key
 * (`plainValue`), not both — sending both is rejected. Every other field
 * echoes its CMS `field.type` back (the forms rule forbids guessing the
 * type); today all non-text `contact_us` fields are `string`, but a future
 * non-string field must not be mislabeled and rejected by `postFormsData`.
 * @param   {object}                 input        - Input
 * @param   {ContactFormField[]}     input.fields - Data fields of the CMS form (no buttons/captcha)
 * @param   {Record<string, string>} input.values - Current values of the card, keyed by CMS marker
 * @returns {ContactFormAnswer[]}                 Answers ready for `postFormsData`
 */
export const buildContactAnswers = ({
  fields,
  values,
}: {
  fields: ContactFormField[];
  values: Record<string, string>;
}): ContactFormAnswer[] =>
  fields
    .filter((field) => (values[field.marker] ?? '') !== '')
    .map((field): ContactFormAnswer => {
      const value = values[field.marker] ?? '';
      if (field.type === 'text') {
        return {
          marker: field.marker,
          type: 'text',
          value: [{ plainValue: value, params: { editorMode: 'plain' } }],
        };
      }
      return { marker: field.marker, type: field.type, value };
    });
