'use client';

import type { JSX } from 'react';

import type { LoaderProps } from '@/app/types/global';

/**
 * MainMenu Loader component.
 * @param   {object}      props       - The properties for the loader.
 * @param   {number}      props.limit - The number of loader items to display.
 * @returns {JSX.Element}             JSX.Element representing the main menu loader.
 */
const MainMenuLoader = ({ limit = 4 }: LoaderProps): JSX.Element => (
  <div className="relative z-20 flex items-center justify-center bg-white px-5 text-lg font-bold text-neutral-600 uppercase max-lg:text-sm max-md:hidden max-md:px-5 max-md:text-sm md:flex">
    <div className="flex w-full max-w-(--breakpoint-xl) items-center justify-center py-5 max-md:px-5">
      <ul className="flex w-full justify-between gap-5 max-md:flex-wrap">
        {Array.from({ length: limit }).map((_, index) => (
          <li
            key={index}
            className="group my-auto flex w-1/4 justify-between gap-5 py-1 whitespace-nowrap"
          >
            <div className="animate-loader relative box-border flex w-full shrink-0 flex-row items-center gap-2.5 text-slate-800 hover:text-red-500">
              <div className="h-5" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default MainMenuLoader;
