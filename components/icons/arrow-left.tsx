import { forwardRef } from 'react';

const ArrowLeftIcon = forwardRef<SVGSVGElement, { active?: boolean }>(
  (props, ref) => {
    return (
      <svg
        ref={ref}
        width="27"
        height="45"
        viewBox="0 0 27 45"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={
          'size-full group-hover:stroke-fuchsia-500 transition-colors duration-300 ' +
          (props.active ? 'stroke-fuchsia-500' : 'stroke-slate-300')
        }
      >
        <path d="M25 1.5L3 21L25 43" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  },
);

ArrowLeftIcon.displayName = 'ArrowLeftIcon';

export default ArrowLeftIcon;
