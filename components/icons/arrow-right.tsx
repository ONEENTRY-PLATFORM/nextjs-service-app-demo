import { forwardRef } from 'react';

const ArrowRightIcon = forwardRef<SVGSVGElement, { active?: boolean }>(
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
          (props?.active ? 'stroke-fuchsia-500' : 'stroke-slate-300')
        }
      >
        <path d="M2 43L24 23.5L2 1.5" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  },
);

ArrowRightIcon.displayName = 'ArrowRightIcon';

export default ArrowRightIcon;
