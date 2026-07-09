import type { JSX, ReactNode } from 'react';

/**
 * SectionHeading component — the shared section heading of the static-html
 * mock (`SectionHeading.tsx`): light Lato uppercase with wide letter-spacing
 * and a thin underline rule, matching the "OUR LOCATIONS" / "GET IN TOUCH"
 * treatment.
 * @param   {object}      props             - Component properties
 * @param   {ReactNode}   props.children    - Heading text
 * @param   {string}      [props.align]     - Horizontal alignment, `center` (default) or `left`
 * @param   {boolean}     [props.underline] - Whether to render the underline rule (default `true`)
 * @param   {string}      [props.size]      - Font size preset: `sm`, `md` (default) or `lg`
 * @param   {string}      [props.className] - Extra CSS classes for the wrapper
 * @returns {JSX.Element}                   Section heading element
 */
const SectionHeading = ({
  children,
  align = 'center',
  underline = true,
  size = 'md',
  className = '',
}: {
  children: ReactNode;
  align?: 'center' | 'left' | undefined;
  underline?: boolean | undefined;
  size?: 'sm' | 'md' | 'lg' | undefined;
  className?: string | undefined;
}): JSX.Element => {
  const fontSize =
    size === 'lg'
      ? 'clamp(1.5rem, 3vw, 2rem)'
      : size === 'sm'
        ? 'clamp(1rem, 1.8vw, 1.25rem)'
        : 'clamp(1.2rem, 2.4vw, 1.65rem)';

  return (
    <div
      className={`flex ${align === 'center' ? 'justify-center' : 'justify-start'} py-3 ${className}`}
    >
      <div className="relative inline-block px-3 py-1.5">
        <h2
          className="font-light tracking-fine whitespace-nowrap text-ink uppercase"
          style={{ fontSize, lineHeight: 1.2 }}
        >
          {children}
        </h2>
        {underline && (
          <div className="absolute inset-x-3 bottom-0 h-px bg-slate-400" />
        )}
      </div>
    </div>
  );
};

export default SectionHeading;
