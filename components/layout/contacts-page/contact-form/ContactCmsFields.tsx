'use client';

import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { IFormAttribute } from 'oneentry/dist/forms/formsInterfaces';
import type { JSX } from 'react';

import { contactFieldFallback } from './contactFieldFallback';
import ContactFormField from './ContactFormField';
import ContactTextareaField from './ContactTextareaField';

/**
 * ContactCmsFields component — the CMS-driven inputs of the "Write to us"
 * card, rendered from the `contact_us` form attributes.
 *
 * Layout mirrors the mock: the first two short fields share a two-column row,
 * further short fields go full width, `text` attributes render as textareas at
 * the end. Labels and placeholders come from the CMS field
 * (`localizeInfos.title`, `additionalFields.placeholder`) with dictionary
 * fallbacks; required flags come from `validators.requiredValidator.strict`.
 * @param   {object}                               props        - Component properties
 * @param   {IFormAttribute[]}                     props.fields - Data fields of the CMS form in admin order
 * @param   {Record<string, string>}               props.values - Current values keyed by CMS marker
 * @param   {(key: string) => (v: string) => void} props.set    - Curried setter for one field
 * @param   {IAttributeValues | undefined}         props.dict   - UI dictionary for the fallback copy
 * @returns {JSX.Element}                                       The card's CMS-driven input stack
 */
const ContactCmsFields = ({
  fields,
  values,
  set,
  dict,
}: {
  fields: IFormAttribute[];
  values: Record<string, string>;
  set: (key: string) => (v: string) => void;
  dict: IAttributeValues | undefined;
}): JSX.Element => {
  /**
   * propsFor — the shared input props of one CMS field: CMS copy first,
   * dictionary fallbacks second, e-mail input type forced by the CMS
   * validator.
   * @param   {IFormAttribute} field - The CMS form field
   * @returns {object}               Props for `ContactFormField` / `ContactTextareaField`
   */
  const propsFor = (field: IFormAttribute) => {
    const fallback = contactFieldFallback(dict, field.marker);
    /** The map itself is typed; each entry's `value` is `unknown` by design. */
    const rawPlaceholder = field.additionalFields?.placeholder?.value;
    const cmsPlaceholder =
      typeof rawPlaceholder === 'string' ? rawPlaceholder : undefined;
    return {
      label: field.localizeInfos?.title || fallback.label,
      placeholder: cmsPlaceholder || fallback.placeholder,
      required: field.validators?.requiredValidator?.strict === true,
      value: values[field.marker] ?? '',
      onChange: set(field.marker),
    };
  };

  /**
   * inputTypeFor — the HTML input type of one CMS field: the e-mail validator
   * wins, the per-marker fallback map shapes the rest (`tel` for the phone).
   * @param   {IFormAttribute} field - The CMS form field
   * @returns {string}               HTML input type
   */
  const inputTypeFor = (field: IFormAttribute): string =>
    field.validators?.emailInspectionValidator
      ? 'email'
      : contactFieldFallback(dict, field.marker).inputType;

  /** Short (single-line) fields — everything except `text` attributes. */
  const shortFields = fields.filter((field) => field.type !== 'text');
  /** Long-form `text` attributes, rendered as textareas after the inputs. */
  const textFields = fields.filter((field) => field.type === 'text');

  return (
    <div className="space-y-5">
      {shortFields.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {shortFields.slice(0, 2).map((field) => (
            <ContactFormField
              key={field.marker}
              {...propsFor(field)}
              type={inputTypeFor(field)}
            />
          ))}
        </div>
      )}
      {shortFields.slice(2).map((field) => (
        <ContactFormField
          key={field.marker}
          {...propsFor(field)}
          type={inputTypeFor(field)}
        />
      ))}
      {textFields.map((field) => (
        <ContactTextareaField key={field.marker} {...propsFor(field)} />
      ))}
    </div>
  );
};

export default ContactCmsFields;
