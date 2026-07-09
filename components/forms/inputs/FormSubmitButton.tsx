import type { JSX } from 'react';

import FormFieldAnimations from '@/components/forms/animations/FormFieldAnimations';
import Spinner from '@/components/shared/Spinner';

/**
 * FormSubmitButton component renders a styled submit button for forms.
 *
 * Provides visual feedback during loading states with a spinner.
 * The button is disabled when in loading state to prevent duplicate submissions.
 * @param   {object}      props           - Component props.
 * @param   {string}      props.title     - Button title/text to display.
 * @param   {boolean}     props.isLoading - Loading state indicator.
 * @param   {number}      props.index     - Index of element for animations stagger.
 * @returns {JSX.Element}                 Form submit button with loading state support.
 */
const FormSubmitButton = ({
  title,
  isLoading,
  index,
}: {
  title: string;
  isLoading: boolean;
  index: number;
}): JSX.Element => {
  return (
    <FormFieldAnimations index={index} className="w-full">
      <button
        disabled={isLoading}
        type="submit"
        className="relative h-15 w-full items-center justify-center rounded-card border-fuchsia-500 bg-fuchsia-500 px-10 py-2.5 text-xl font-bold tracking-wide text-white uppercase transition-colors duration-300 hover:bg-fuchsia-600 focus-visible:outline-fuchsia-600 disabled:bg-neutral-300/50 disabled:text-neutral-300"
      >
        {isLoading ? <Spinner /> : title}
      </button>
    </FormFieldAnimations>
  );
};

export default FormSubmitButton;
