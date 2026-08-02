import { buildContactAnswers } from '@/components/layout/contacts-page/contact-form/buildContactAnswers';
import type { ContactFormField } from '@/components/layout/contacts-page/contact-form/types';

/** The `contact_us` form as the CMS defines it today. */
const CONTACT_FIELDS: ContactFormField[] = [
  { marker: 'name', type: 'string' },
  { marker: 'phone', type: 'string' },
  { marker: 'email', type: 'string' },
  { marker: 'contact_text', type: 'text' },
];

/** The untouched card — the CMS markers carry no value yet. */
const EMPTY_VALUES: Record<string, string> = {};

/**
 * values — the card's local state with the given markers filled in.
 * @param   {Record<string, string>} over - Values keyed by CMS marker
 * @returns {Record<string, string>}      Card values
 */
const values = (over: Record<string, string>): Record<string, string> => ({
  ...EMPTY_VALUES,
  ...over,
});

describe('buildContactAnswers', () => {
  it('skips fields the visitor left blank', () => {
    const answers = buildContactAnswers({
      fields: CONTACT_FIELDS,
      values: values({ name: 'Ann', contact_text: 'Hi' }),
    });

    expect(answers.map((a) => a.marker)).toEqual(['name', 'contact_text']);
  });

  it('sends a text field as a single-key plainValue array', () => {
    const answers = buildContactAnswers({
      fields: CONTACT_FIELDS,
      values: values({ contact_text: 'Hi there' }),
    });

    expect(answers[0]).toEqual({
      marker: 'contact_text',
      type: 'text',
      value: [{ plainValue: 'Hi there', params: { editorMode: 'plain' } }],
    });
  });

  it('sends an ordinary field as a bare string', () => {
    const answers = buildContactAnswers({
      fields: CONTACT_FIELDS,
      values: values({ email: 'a@b.com' }),
    });

    expect(answers[0]).toEqual({
      marker: 'email',
      type: 'string',
      value: 'a@b.com',
    });
  });

  it('ignores CMS fields the card has no input for', () => {
    const answers = buildContactAnswers({
      fields: [...CONTACT_FIELDS, { marker: 'unknown_field', type: 'string' }],
      values: values({ name: 'Ann' }),
    });

    expect(answers.map((a) => a.marker)).toEqual(['name']);
  });

  it('yields nothing for an untouched form', () => {
    expect(
      buildContactAnswers({
        fields: CONTACT_FIELDS,
        values: EMPTY_VALUES,
      }),
    ).toEqual([]);
  });
});
