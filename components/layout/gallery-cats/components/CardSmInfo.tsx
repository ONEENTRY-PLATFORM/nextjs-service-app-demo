import type { JSX } from 'react';

/**
 * CardSmInfo component
 * @param   {object}      props                - CardSmInfo component props
 * @param   {object}      props.cardData       - Card data
 * @param   {string}      props.cardData.title - Card title
 * @returns {JSX.Element}                      representing the CardSmInfo component
 */
const CardSmInfo = ({
  cardData: { title },
}: {
  cardData: {
    title: string;
  };
}): JSX.Element => {
  return (
    <div className="absolute bottom-0 left-0 w-full bg-transparent">
      {/** */}
      <div className="gallery-card-content flex size-full flex-col gap-1 px-8 py-6">
        <h2 className="text-center text-white uppercase">{title}</h2>
      </div>
      {/** */}
      <div className="gallery-card-info-bg"></div>
    </div>
  );
};

export default CardSmInfo;
