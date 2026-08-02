import type { IAttributeValues } from 'oneentry/dist/base/utils';

import { dictText } from '@/components/utils/dictText';

/**
 * Fallback copy and input shaping for one contact-form field.
 * @property {string} label       - Label text above the input
 * @property {string} placeholder - Input placeholder
 * @property {string} inputType   - HTML input type
 */
export type ContactFieldFallback = {
  label: string;
  placeholder: string;
  inputType: string;
};

/**
 * contactFieldFallback — dictionary-backed copy for one contact-form field,
 * keyed by its CMS marker.
 *
 * Still CMS data: the labels and placeholders come from the `system_content`
 * dictionary (`contact_*` markers) with English defaults per the project
 * convention. The form field's own `localizeInfos.title` /
 * `additionalFields.placeholder` win at the call site whenever the admin fills
 * them in; these values cover what the form definition leaves empty — today
 * every placeholder — so the card never renders a blank label. Unknown markers
 * fall back to the marker itself so a newly added CMS field still renders
 * labeled.
 * @param   {IAttributeValues | undefined} dict   - UI dictionary from the `system_content` block
 * @param   {string}                       marker - CMS marker of the form field
 * @returns {ContactFieldFallback}                Label, placeholder and HTML input type
 */
export const contactFieldFallback = (
  dict: IAttributeValues | undefined,
  marker: string,
): ContactFieldFallback => {
  switch (marker) {
    case 'name':
      return {
        label: dictText(dict, 'contact_name_label', 'Your name'),
        placeholder: dictText(dict, 'contact_name_placeholder', 'Jane Doe'),
        inputType: 'text',
      };
    case 'phone':
      return {
        label: dictText(dict, 'phone_text', 'Phone'),
        placeholder: dictText(
          dict,
          'contact_phone_placeholder',
          '+971 50 123 4567',
        ),
        inputType: 'tel',
      };
    case 'email':
      return {
        label: dictText(dict, 'contact_email_label', 'E-mail'),
        placeholder: dictText(
          dict,
          'contact_email_placeholder',
          'you@example.com',
        ),
        inputType: 'email',
      };
    case 'contact_text':
      return {
        label: dictText(dict, 'contact_message_label', 'Message'),
        placeholder: dictText(
          dict,
          'contact_message_placeholder',
          'How can we help you?',
        ),
        inputType: 'text',
      };
    default:
      return { label: marker, placeholder: '', inputType: 'text' };
  }
};
