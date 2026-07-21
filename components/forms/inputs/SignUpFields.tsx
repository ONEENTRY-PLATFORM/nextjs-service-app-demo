'use client';

import type { IFormAttribute } from 'oneentry/dist/forms/formsInterfaces';
import type { JSX } from 'react';
import { useMemo } from 'react';

import FormInput from './FormInput';

/**
 * SignUpFields — the dynamic field list of the sign-up form.
 *
 * First and last name share a two-column row on `lg`, as in the mock. Only
 * ADJACENT name fields are paired, so the CMS field order stays authoritative —
 * any other arrangement renders single-column.
 * @param   {object}           props        - Component properties
 * @param   {IFormAttribute[]} props.fields - Visible CMS fields, in display order
 * @returns {JSX.Element}                   Field list
 */
const SignUpFields = ({
  fields,
}: {
  fields: IFormAttribute[];
}): JSX.Element => {
  const namePair = useMemo(() => {
    const nameIdx = fields.findIndex((f) => /^(first_?)?name/i.test(f.marker));
    const surnameIdx = fields.findIndex((f) =>
      /^(sur|last_?)name/i.test(f.marker),
    );
    return nameIdx >= 0 && surnameIdx === nameIdx + 1 ? nameIdx : -1;
  }, [fields]);

  return (
    <div className="relative mb-4 box-border flex shrink-0 flex-col gap-4">
      {fields.map((field, index) => {
        if (namePair >= 0 && index === namePair + 1) {
          /** Rendered inside the pair row below */
          return null;
        }
        if (namePair >= 0 && index === namePair) {
          const surnameField = fields[index + 1];
          return (
            <div
              key={field.marker}
              className="grid grid-cols-1 gap-4 lg:grid-cols-2"
            >
              <FormInput index={index} {...field} />
              {surnameField && (
                <FormInput index={index + 1} {...surnameField} />
              )}
            </div>
          );
        }
        return <FormInput key={field.marker} index={index} {...field} />;
      })}
    </div>
  );
};

export default SignUpFields;
