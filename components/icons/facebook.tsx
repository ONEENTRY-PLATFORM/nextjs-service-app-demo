const FacebookIcon = (props?: { active?: boolean }) => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={
        'size-full group-hover:fill-fuchsia-500 transition-colors duration-300 ' +
        (props?.active ? 'fill-fuchsia-500' : 'fill-slate-700')
      }
    >
      <path d="M31.8662 16.0388C31.8662 7.4614 25.1462 0.5 16.8662 0.5C8.58621 0.5 1.86621 7.4614 1.86621 16.0388C1.86621 23.5596 7.02621 29.8218 13.8662 31.2669V20.7005H10.8662V16.0388H13.8662V12.1541C13.8662 9.15514 16.2212 6.71554 19.1162 6.71554H22.8662V11.3772H19.8662C19.0412 11.3772 18.3662 12.0764 18.3662 12.9311V16.0388H22.8662V20.7005H18.3662V31.5C25.9412 30.7231 31.8662 24.1035 31.8662 16.0388Z" />
    </svg>
  );
};

export default FacebookIcon;
