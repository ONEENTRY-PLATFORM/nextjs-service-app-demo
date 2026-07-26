'use client';

import type { JSX } from 'react';

/**
 * ContactFormField component — a labeled input of the contact form.
 * @param   {object}              props             - Component properties
 * @param   {string}              props.label       - Field label above the input
 * @param   {string}              props.value       - Controlled input value
 * @param   {(v: string) => void} props.onChange    - Change handler receiving the new value
 * @param   {string}              props.placeholder - Input placeholder
 * @param   {string}              props.type        - HTML input type
 * @returns {JSX.Element}                           Labeled form input
 */
const ContactFormField = ({
  label,
  value,
  onChange,
  placeholder,
  type,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type: string;
}): JSX.Element => (
  <div>
    <label className="mb-2.5 block text-base font-normal text-neutral-300">
      {label}
    </label>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-2xl border border-slate-240 px-4 py-3 text-base text-slate-400 transition-all outline-none focus:border-accent-pink"
    />
  </div>
);

export default ContactFormField;
