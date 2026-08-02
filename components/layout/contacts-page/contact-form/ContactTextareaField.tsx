'use client';

import type { JSX } from 'react';

/**
 * ContactTextareaField component — the labeled message textarea of the contact
 * form.
 * @param   {object}              props             - Component properties
 * @param   {string}              props.label       - Field label above the textarea
 * @param   {string}              props.value       - Controlled textarea value
 * @param   {(v: string) => void} props.onChange    - Change handler receiving the new value
 * @param   {string}              props.placeholder - Textarea placeholder
 * @param   {boolean}             [props.required]  - The CMS marks the field as required
 * @returns {JSX.Element}                           Labeled form textarea
 */
const ContactTextareaField = ({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  required?: boolean | undefined;
}): JSX.Element => (
  <div>
    <label className="mb-2.5 block text-base font-normal text-neutral-300">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      rows={4}
      className="w-full resize-none rounded-2xl border border-slate-240 px-4 py-3 text-base text-slate-400 transition-all outline-none focus:border-accent-pink"
    />
  </div>
);

export default ContactTextareaField;
