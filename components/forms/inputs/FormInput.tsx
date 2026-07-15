import type { IAttributes } from 'oneentry/dist/base/utils';
import type { JSX, Key } from 'react';
import { useEffect, useState } from 'react';

import { useAppDispatch } from '@/app/store/hooks';
import { addField } from '@/app/store/reducers/FormFieldsSlice';
import { FormFieldsEnum } from '@/app/types/enum';
import FormFieldAnimations from '@/components/forms/animations/FormFieldAnimations';
import EyeIcon from '@/components/icons/eye';
import EyeOpenIcon from '@/components/icons/eye-o';

/**
 * FormInput component renders a form input field based on the provided field configuration.
 * It handles different input types (text, password, email, textarea, select) and
 * manages the field's value in the Redux store. It also provides password visibility toggle.
 * @param   {object}      field               - Field configuration object
 * @param   {string}      field.value         - Initial value for the field
 * @param   {number}      field.index         - Index of element for animations stagger
 * @param   {object}      field.localizeInfos - Localized information for the field
 * @param   {string}      field.marker        - Unique identifier for the field
 * @param   {string}      field.type          - Type of the field (text, password, etc.)
 * @param   {object}      field.validators    - Validation rules for the field
 * @param   {object[]}    field.listTitles    - List of options for select fields
 * @returns {JSX.Element}                     FormInput component with appropriate input type and validation
 */
const FormInput = (
  field: IAttributes & { value?: string; index: number },
): JSX.Element => {
  /** Extract localized information from field properties */
  const { localizeInfos } = field;
  /** Initialize state for input field value with existing value or empty string */
  const [value, setValue] = useState<string>(field.value || '');
  /** Get Redux dispatch function for updating form state */
  const dispatch = useAppDispatch();
  const valid = true;

  /**
   * Field-shaping flags come from the CMS field, not from the marker string:
   * `isPassword` marks a password field, the email validator marks an email
   * field, `isSignUpRequired` marks a required field. (These runtime flags are
   * not in the SDK's `IAttributes` type, hence the cast.)
   */
  const flags = field as IAttributes & {
    isPassword?: boolean;
    isSignUpRequired?: boolean;
  };
  const validators = (field.validators ?? {}) as {
    requiredValidator?: { strict?: boolean };
    emailInspectionValidator?: boolean;
    stringInspectionValidator?: { stringMin?: number; stringMax?: number };
  };

  /**
   * Placeholder and hint are authored per field in the CMS
   * (`additionalFields`); the label title is only a fallback for the
   * placeholder so the input is never left blank.
   */
  const additionalFields = (
    field as IAttributes & {
      additionalFields?: {
        placeholder?: { value?: string };
        hint?: { value?: string };
      };
    }
  ).additionalFields;
  const placeholder =
    additionalFields?.placeholder?.value || localizeInfos?.title || '';
  const hint = additionalFields?.hint?.value;

  /**
   * Determine the input type from the flags. The marker is only a fallback for
   * the confirm-password field, which carries `isPassword: false` in the CMS
   * yet must stay masked.
   */
  const fieldType = (FormFieldsEnum as unknown as Record<string, string>)[
    flags.isPassword || field.marker.indexOf('password') !== -1
      ? 'password'
      : validators.emailInspectionValidator ||
          field.marker.indexOf('email') !== -1
        ? 'email'
        : field.type
  ];

  /** State for toggling password visibility (text/password), defaults to determined field type */
  const [type, setType] = useState<string>(fieldType || 'text');

  /** Required-ness comes from the CMS `isSignUpRequired` flag, not a validator */
  const required = flags.isSignUpRequired ?? false;
  /** Extract minimum length validation rule from field validators */
  const minLength = validators['stringInspectionValidator']?.stringMin;
  /** Extract maximum length validation rule from field validators */
  const maxLength = validators['stringInspectionValidator']?.stringMax;

  /** Update form state in Redux store whenever input value or validity changes */
  useEffect(() => {
    dispatch(
      addField({
        [field.marker]: {
          valid: valid,
          value: value,
        },
      }),
    );
  }, [value, valid, dispatch, field.marker]);

  /** Render nothing if field or type is not defined */
  if (!field || !type) {
    return <></>;
  }

  /* Render input field with appropriate type and validation rules */
  return (
    <FormFieldAnimations
      index={field.index}
      className="relative box-border flex shrink-0 flex-col"
    >
      <label htmlFor={field.marker} className="text-xl text-gray-400">
        {localizeInfos?.title}{' '}
        {required && <span className="text-red-500">*</span>}
      </label>
      {/* inputType select */}
      {type === 'list' && (
        <select
          id={field.marker}
          className="border-b border-none border-b-slate-300 py-3 text-xl text-zinc-600"
          required={required}
          value={value}
          onChange={(val) => setValue(val.currentTarget.value)}
        >
          {field.listTitles.map((option, i: Key) => {
            return (
              <option key={i} value={option.value as string}>
                {option.title}
              </option>
            );
          })}
        </select>
      )}
      {/* inputType textarea */}
      {type === 'textarea' && (
        <textarea
          id={field.marker}
          placeholder={placeholder}
          className="border-b border-none border-b-slate-300 py-3 text-xl text-zinc-600"
          required={required}
          onChange={(val) => setValue(val.currentTarget.value)}
          value={value}
        />
      )}
      {/* inputType text/password/email... */}
      {type !== 'textarea' && type !== 'list' && (
        <input
          type={type}
          id={field.marker}
          placeholder={placeholder}
          className="relative border-b border-none border-b-slate-300 py-3 text-xl text-zinc-600"
          required={required}
          onChange={(val) => setValue(val.currentTarget.value)}
          autoComplete={fieldType === 'password' ? 'password' : ''}
          minLength={minLength}
          maxLength={maxLength}
          value={value}
        />
      )}
      {/* password button */}
      {fieldType === 'password' && (
        <button
          onClick={(e) => {
            e.preventDefault();
            if (type === 'password') {
              setType('text');
            } else {
              setType('password');
            }
          }}
          className="absolute right-2 bottom-3 flex size-6 items-center"
        >
          {type === 'password' ? <EyeIcon /> : <EyeOpenIcon />}
        </button>
      )}
      {/* Field hint authored in the CMS, shown under the input */}
      {hint && <p className="mt-1 text-xs text-neutral-300">{hint}</p>}
    </FormFieldAnimations>
  );
};

export default FormInput;
