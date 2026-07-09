import type { JSX } from 'react';

import CardAnimations from '@/app/animations/CardAnimations';
import LineAnimations from '@/app/animations/LineAnimations';
import TitleAnimations from '@/app/animations/TitleAnimations';
import ReviewsIcon from '@/components/icons/reviews';
import StarsGroup from '@/components/shared/StarsGroup';

import LoaderAnimations from '../animations/LoaderAnimations';

/**
 * MasterLoader component to display loading skeleton for master details page.
 *
 * This component renders a skeleton loader with placeholder elements
 * while the master details are being fetched. It includes placeholders
 * for master image, information, reviews, description and related works.
 *
 * The loader uses various animation components to provide a smooth loading experience:
 * - TitleAnimations for the page title
 * - LoaderAnimations for the main content area
 * - CardAnimations for the related works grid
 * - LineAnimations for decorative elements
 * @returns {JSX.Element} JSX.Element representing the MasterLoader component with skeleton placeholders
 */
const MasterLoader = (): JSX.Element => {
  return (
    <>
      <section className="loader relative mx-auto box-border flex w-full max-w-360 shrink-0 flex-col">
        <div className="flex w-full flex-col justify-center px-5 py-20 max-md:max-w-full max-sm:py-10">
          <TitleAnimations className="relative mx-auto mb-16 box-border flex shrink-0 flex-col max-lg:mb-8 max-sm:mb-6">
            <h1 className="title min-w-65 bg-slate-200 text-center text-4xl leading-9 font-light text-transparent uppercase max-sm:leading-none">
              {'___  ___'}
            </h1>
            <hr className="mx-auto mt-5 h-px w-full max-w-37.5 self-center border-solid border-gray-100" />
          </TitleAnimations>
          <LoaderAnimations className="flex w-full gap-20 max-lg:gap-10 max-md:flex-col">
            <div className="flex w-[30%] grow flex-col max-md:mt-10 max-md:w-full max-sm:mt-5">
              <figure className="item mb-8 overflow-hidden rounded-3xl bg-slate-200 max-sm:h-64">
                <svg
                  className="aspect-photo h-116 w-99.5 max-w-full object-cover"
                  width="1"
                  height="1"
                  viewBox="0 0 1 1"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                >
                  <rect width="1" height="1" fill="none" />
                </svg>
              </figure>
              <div className="item flex flex-wrap justify-between gap-2.5 bg-slate-200 px-4 text-xl leading-8 text-transparent">
                {'__'}
              </div>
            </div>
            <div className="flex w-[70%] flex-col max-md:w-full">
              <div className="flex flex-col max-md:max-w-full">
                <div className="mb-6 flex justify-between gap-6 max-lg:flex-wrap">
                  {/* Display master information */}
                  <div className="flex w-full flex-col">
                    <h2 className="item mb-4 w-full bg-slate-200 text-3xl leading-5 text-transparent max-sm:text-2xl">
                      {'__'}
                    </h2>
                    <p className="item w-full bg-slate-200 text-xl text-transparent max-sm:text-sm">
                      {'__'}
                    </p>
                    <p className="item w-full bg-slate-200 text-lg text-transparent max-sm:mb-2.5 max-sm:text-sm">
                      {'__'}
                      <span className="item bg-slate-200 font-bold text-transparent">
                        {'__'}
                      </span>
                    </p>
                  </div>
                  {/* Display reviews for the master */}
                  <div className="flex items-end gap-3.5 self-start whitespace-nowrap">
                    <div className="item flex items-center justify-between gap-1.5 text-xl leading-6">
                      <StarsGroup rating={0} size={20} />
                      <div className="self-stretch bg-slate-200 text-transparent">
                        {'___'}
                      </div>
                    </div>
                    <div className="mr-16 flex items-center gap-3.5">
                      <div className="item bg-slate-200 text-lg text-transparent">
                        Reviews
                      </div>
                      <div className="item flex gap-2.5 leading-none">
                        <ReviewsIcon size={6} />
                        <div className="bg-slate-200 text-xl leading-5 text-transparent">
                          {'__'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Display master description */}
                <div className="item mb-10 min-h-72 bg-slate-200 text-lg leading-6 tracking-wide text-transparent max-md:max-w-full max-sm:text-base">
                  {'___'}
                </div>
                <button className="item h-12.5 items-center justify-center self-start rounded-3xl border border-solid border-fuchsia-500 bg-transparent px-8 py-1 text-md font-bold tracking-wide text-fuchsia-500 uppercase transition-colors duration-300 hover:border-fuchsia-600 hover:text-fuchsia-600 focus-visible:text-fuchsia-600 focus-visible:outline-fuchsia-600 disabled:border-neutral-300 disabled:text-neutral-300">
                  {'BOOK'}
                </button>
              </div>
            </div>
          </LoaderAnimations>
        </div>
      </section>
      <div className="flex min-h-[50vh] w-full flex-col justify-center">
        <div className="mx-auto flex w-full flex-col">
          <LineAnimations className="gradient-bg-line-20" delay={0} />
          <div className="grid w-full grid-cols-6 gap-0 max-2xl:grid-cols-5 max-lg:grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-2">
            {Array.from({ length: 12 }).map((_, index) => (
              <CardAnimations
                className="group relative flex min-h-80 flex-col overflow-hidden max-xs:min-h-60 max-xs:min-w-[50vw] max-md:min-h-65"
                index={index}
                key={index}
              >
                <div className="group relative flex w-full flex-col justify-center text-sm text-white">
                  <figure className="relative flex min-h-80 w-full flex-col overflow-hidden bg-slate-200">
                    <div className="gallery-card-img relative h-80 w-full object-cover duration-500 group-hover:scale-125 group-hover:transition-transform" />
                  </figure>
                </div>
              </CardAnimations>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default MasterLoader;
