import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { JSX, Key } from 'react';

import TitleAnimations from '@/app/animations/TitleAnimations';

import SpecialistCard from './components/SpecialistCard';

interface ItemProps {
  title: string;
  cards: IAdminEntity[];
  specialization: {
    id: string;
    title: string;
    pageUrl: string;
  };
}

/**
 * MastersGrid component displays masters grouped by specialization in a grid layout
 * @param   {object}                                                                                                 props             - Component properties
 * @param   {{title: string, cards: IAdminEntity[], specialization: {id: string, title: string, pageUrl: string}}[]} props.mastersData - Array of master data grouped by specialization
 * @returns {Promise<JSX.Element>}                                                                                                     Promise resolving to a JSX element with masters displayed in grid sections
 */
const MastersGrid = async ({
  mastersData,
}: {
  mastersData: {
    title: string;
    cards: IAdminEntity[];
    specialization: {
      id: string;
      title: string;
      pageUrl: string;
    };
  }[];
}): Promise<JSX.Element> => {
  return (
    <>
      {mastersData
        // Filter out sections with no cards
        .filter((item: ItemProps) => item.cards.length > 0)
        .map((item: ItemProps, index: Key) => (
          <section
            key={index}
            className="mx-auto flex w-400 max-w-full flex-col items-center px-5 pt-10"
          >
            <TitleAnimations
              delay={0.5}
              className="relative mx-auto mb-10 box-border flex shrink-0 flex-col"
            >
              <h2 className="title mb-5 text-center text-4xl leading-10 font-light text-ink uppercase max-md:max-w-full">
                {item?.title}
              </h2>
              <hr className="relative mb-2.5 h-px w-full max-w-37.5 self-center border-b border-solid border-b-gray-600" />
            </TitleAnimations>
            <div className="mb-16 flex flex-row flex-wrap justify-center gap-16 self-stretch max-md:max-w-full max-md:gap-5">
              {item.cards?.map((card: IAdminEntity, index: number) => {
                return (
                  <SpecialistCard
                    key={index}
                    item={card}
                    index={index}
                    specialization={item.specialization}
                  />
                );
              })}
            </div>
          </section>
        ))}
    </>
  );
};

export default MastersGrid;
