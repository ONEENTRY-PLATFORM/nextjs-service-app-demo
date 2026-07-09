const StarOpenIconLg = ({ size }: { size: number }) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={
        'size-' + size + ' fill-blue-350 transition-colors duration-300'
      }
    >
      <path d="M10 1.62978L12.6375 6.97394L12.7538 7.20966L13.014 7.24746L18.9116 8.10444L14.644 12.2643L14.4558 12.4478L14.5002 12.7069L15.5077 18.5807L10.2327 15.8074L10 15.6851L9.76733 15.8074L4.49232 18.5807L5.49976 12.7069L5.54419 12.4478L5.35596 12.2643L1.08839 8.10444L6.98603 7.24746L7.24616 7.20966L7.3625 6.97394L10 1.62978Z" />
    </svg>
  );
};

export default StarOpenIconLg;
