import type { JSX } from 'react';

import CardAnimations from '@/app/animations/CardAnimations';

/**
 * PortfolioGridLoader
 * @returns {Promise<JSX.Element>} PortfolioGridLoader
 */
const PortfolioGridLoader = async (): Promise<JSX.Element> => {
  return (
    <div className="grid w-full grid-cols-6 gap-0 max-2xl:grid-cols-5 max-lg:grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-2">
      {Array.from({ length: 12 }).map((_card, index) => (
        <CardAnimations
          className="group relative flex min-h-80 flex-col overflow-hidden max-xs:min-h-60 max-xs:min-w-[50vw] max-md:min-h-65"
          index={index}
          key={index}
        >
          <div className="group relative flex w-full flex-col justify-center">
            <figure className="relative flex min-h-80 w-full flex-col overflow-hidden bg-slate-100">
              <div className="gallery-card-img relative h-80 w-full object-cover duration-500 group-hover:scale-125 group-hover:transition-transform"></div>
            </figure>
          </div>
        </CardAnimations>
      ))}
    </div>
  );
};

export default PortfolioGridLoader;
