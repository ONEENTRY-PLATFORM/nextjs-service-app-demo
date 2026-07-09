import Image from 'next/image';
import type { JSX } from 'react';

/**
 * Empty image placeholder component
 *
 * This component renders a placeholder image when no image is available.
 * It displays the Thalia logo as a fallback image.
 * @param   {object}      props             - Component properties
 * @param   {string}      [props.className] - CSS classes to apply to the container
 * @returns {JSX.Element}                   Placeholder component with Thalia logo
 */
const Placeholder = ({ className }: { className?: string }): JSX.Element => {
  return (
    <div
      className={
        'relative flex size-full flex-col items-center justify-center overflow-hidden rounded-xl bg-slate-100 ' +
        className
      }
    >
      <Image
        fill
        sizes="(min-width: 600px) 50vw, 100vw"
        src={'/images/thalia-logo.svg'}
        alt={'Thalia'}
        className={'mx-auto size-full max-w-[60%] ' + className}
      />
    </div>
  );
};

export default Placeholder;
