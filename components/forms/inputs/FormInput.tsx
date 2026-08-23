import type { IFormAttribute } from 'oneentry/types';
import type { JSX, Key } from 'react';
import { useEffect, useRef, useState } from 'react';

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
  field: IFormAttribute & { value?: string; index: number },
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
   * field, `isSignUpRequired` marks a required field. `IFormAttribute` declares
   * them, so no cast is needed — `IAttributes` did not, which is what the old
   * cast here was working around.
   */
  const flags = field;
  /** SDK-typed validators map — `IAttributeValidators` covers every read here. */
  const validators = field.validators;

  /**
   * Placeholder and hint are authored per field in the CMS
   * (`additionalFields`); the label title is only a fallback for the
   * placeholder so the input is never left blank.
   */
  const additionalFields = field.additionalFields;
  /** The map itself is typed; each entry's `value` is `unknown` by design. */
  const placeholder =
    (additionalFields?.placeholder?.value as string | undefined) ||
    localizeInfos?.title ||
    '';
  const hint = additionalFields?.hint?.value as string | undefined;

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

  /**
   * Initial value captured at mount for the one-time store registration; a ref
   * keeps the mount effect's dependency list free of per-keystroke values.
   */
  const initialValueRef = useRef(field.value || '');

  /**
   * Register the field's initial value in the store once per mount. Mount-time
   * seeding is load-bearing: submit handlers read untouched fields from the
   * store bag (`UserForm` sends stored profile values), and remounting a form
   * must reset stale drafts left by a previously opened form that shares
   * markers (SignIn / SignUp both render the `reg` form). Typing never goes
   * through an effect — only through `handleChange` below.
   */
  useEffect(() => {
    dispatch(
      addField({
        [field.marker]: {
          valid: true,
          value: initialValueRef.current,
        },
      }),
    );
  }, [dispatch, field.marker]);

  /**
   * handleChange — the single write path for the field: updates the local
   * input state and mirrors it into `FormFieldsSlice` within the same event,
   * so typing costs one render pass instead of the render → effect →
   * dispatch → render cascade the common-mistakes rule forbids.
   * @param {string} next - The new input value
   */
  const handleChange = (next: string): void => {
    setValue(next);
    dispatch(
      addField({
        [field.marker]: {
          valid: valid,
          value: next,
        },
      }),
    );
  };

  /** Render nothing if field or type is not defined */
  if (!field || !type) {
    return <></>;
  }

  /* Render input field with appropriate type and validation rules */
  return (
    <FormFieldAnimations
      index={field.index}
      className="relative box-border flex shrink-0 flex-col gap-1"
    >
      <label htmlFor={field.marker} className="text-base text-neutral-300">
        {localizeInfos?.title}{' '}
        {required && <span className="text-red-500">*</span>}
      </label>
      {/* inputType select */}
      {type === 'list' && (
        <select
          id={field.marker}
          data-testid={`form-field-${field.marker}`}
          className="border-b border-none border-b-slate-240 py-2 text-base text-slate-400"
          required={required}
          value={value}
          onChange={(val) => handleChange(val.currentTarget.value)}
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
          data-testid={`form-field-${field.marker}`}
          placeholder={placeholder}
          className="border-b border-none border-b-slate-240 py-2 text-base text-slate-400"
          required={required}
          onChange={(val) => handleChange(val.currentTarget.value)}
          value={value}
        />
      )}
      {/* inputType text/password/email... */}
      {type !== 'textarea' && type !== 'list' && (
        <input
          type={type}
          id={field.marker}
          data-testid={`form-field-${field.marker}`}
          placeholder={placeholder}
          className="relative border-b border-none border-b-slate-240 py-2 text-base text-slate-400"
          required={required}
          onChange={(val) => handleChange(val.currentTarget.value)}
          autoComplete={fieldType === 'password' ? 'password' : ''}
          minLength={minLength}
          maxLength={maxLength}
          value={value}
        />
      )}
      {/* password button */}
      {fieldType === 'password' && (
        <button
          type="button"
          aria-label={type === 'password' ? 'Show password' : 'Hide password'}
          aria-pressed={type !== 'password'}
          onClick={() => {
            if (type === 'password') {
              setType('text');
            } else {
              setType('password');
            }
          }}
          className="absolute right-0 bottom-2 flex size-5 items-center"
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
