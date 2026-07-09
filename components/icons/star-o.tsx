const StarOpenIcon = ({ size }: { size: number }) => {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={
        'size-[' +
        size +
        'px] fill-slate-200 transition-colors duration-300 max-sm:size-4'
      }
    >
      <path d="M6.89437 0.623047L8.92057 4.72858L13.4513 5.38694L10.1728 8.58265L10.9468 13.0951L6.89437 10.9646L2.84196 13.0951L3.6159 8.58265L0.337434 5.38694L4.86816 4.72858L6.89437 0.623047Z" />
    </svg>
  );
};

export default StarOpenIcon;
