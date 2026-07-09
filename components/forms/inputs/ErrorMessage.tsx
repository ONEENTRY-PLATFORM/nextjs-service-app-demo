import type { JSX } from 'react';

/**
 * ErrorMessage component renders an error message with consistent styling.
 * @param   {object}      props       - Component props.
 * @param   {string}      props.error - Error text to display.
 * @returns {JSX.Element}             JSX element displaying the error message.
 */
const ErrorMessage = ({ error }: { error: string }): JSX.Element => {
  return <div className="text-center text-sm text-red-500">{error}</div>;
};

export default ErrorMessage;
