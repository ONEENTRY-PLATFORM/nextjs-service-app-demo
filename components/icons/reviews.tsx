const ReviewsIcon = ({ size }: { size: number }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={
        'size-' + size + ' stroke-blue-350 transition-colors duration-300'
      }
    >
      <path
        d="M13.2828 0.988862C7.58487 0.672227 2.70913 5.03352 2.3925 10.7322C2.28474 12.6542 2.72094 14.478 3.55128 16.0692L1.60645 22.6389L8.95252 20.9287C9.94597 21.3155 11.0132 21.5605 12.1358 21.6225C17.8338 21.9399 22.7095 17.5771 23.0262 11.8792C23.3435 6.18123 18.9815 1.30624 13.2828 0.988862Z"
        stroke="#4C4D56"
        strokeWidth="1.26094"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ReviewsIcon;
