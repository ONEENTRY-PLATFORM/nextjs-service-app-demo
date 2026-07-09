const Phone2Icon = (props?: { active?: boolean }) => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={
        'size-4 group-hover:fill-fuchsia-500 transition-colors duration-300 ' +
        (props?.active ? 'fill-fuchsia-500' : 'fill-slate-700')
      }
    >
      <path d="M22.5414 22.4293L16.4877 20.8516C13.5577 17.8111 12.1919 15.1763 12.3354 12.0443L15.8517 8.27677L16.1992 3.4822L11.1206 1.30349C9.59401 0.648554 7.83371 1.08368 7.39391 2.31924C6.29596 5.40378 4.95151 11.2737 7.68705 17.0761C10.5598 23.1695 16.991 28.0379 20.6818 30.4596C22.107 31.3949 24.0502 31.0677 24.7642 29.8513L26.9111 26.1935L22.5414 22.4293Z" />
    </svg>
  );
};

export default Phone2Icon;
