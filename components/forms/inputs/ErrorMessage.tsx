import type { JSX } from 'react';

/**
 * ErrorMessage component renders an error message with consistent styling.
 *
 * The testid is feature-neutral (`form-error`) because this primitive is shared
 * by the auth forms, the profile form and the contacts form — tests scope it
 * through the owning form's root testid.
 * @param   {object}      props       - Component props.
 * @param   {string}      props.error - Error text to display.
 * @returns {JSX.Element}             JSX element displaying the error message.
 */
const ErrorMessage = ({ error }: { error: string }): JSX.Element => {
  return (
    <div data-testid="form-error" className="text-center text-sm text-red-500">
      {error}
    </div>
  );
};

export default ErrorMessage;
