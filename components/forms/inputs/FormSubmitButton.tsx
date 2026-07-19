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
        data-testid="form-submit"
        disabled={isLoading}
        type="submit"
        className="relative flex min-h-14 w-full items-center justify-center rounded-xl bg-gradient-brand px-10 py-3.5 text-base font-bold tracking-widest text-white uppercase shadow-[0_8px_24px_#ed21f144] transition-transform duration-150 hover:scale-102 focus-visible:outline-fuchsia-600 active:scale-97 disabled:bg-slate-50 disabled:bg-none disabled:text-neutral-300 disabled:shadow-none"
      >
        {isLoading ? <Spinner /> : title}
      </button>
    </FormFieldAnimations>
  );
};

export default FormSubmitButton;
