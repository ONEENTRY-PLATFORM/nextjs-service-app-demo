import type { ContactFormAnswer, ContactFormField, FieldKey } from './types';

/**
 * buildContactAnswers — maps the card's local values onto the CMS form
 * attributes by marker.
 *
 * Fields the visitor left blank are skipped: an empty string must not be
 * submitted as an answer. A `text` attribute carries exactly ONE value key
 * (`plainValue`), not both — sending both is rejected.
 * @param   {object}                  input        - Input
 * @param   {ContactFormField[]}      input.fields - Data fields of the CMS form (no buttons/captcha)
 * @param   {Record<FieldKey,string>} input.values - Current values of the card
 * @returns {ContactFormAnswer[]}                  Answers ready for `postFormsData`
 */
export const buildContactAnswers = ({
  fields,
  values,
}: {
  fields: ContactFormField[];
  values: Record<FieldKey, string>;
}): ContactFormAnswer[] =>
  fields
    .filter((field) => (values[field.marker as FieldKey] ?? '') !== '')
    .map((field): ContactFormAnswer => {
      const value = values[field.marker as FieldKey] ?? '';
      if (field.type === 'text') {
        return {
          marker: field.marker,
          type: 'text',
          value: [{ plainValue: value, params: { editorMode: 'plain' } }],
        };
      }
      return { marker: field.marker, type: 'string', value };
    });
