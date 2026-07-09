'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { FormEvent, JSX } from 'react';
import { Suspense, useState } from 'react';
import { useDebounce } from 'use-debounce';

import SearchIcon from '@/components/icons/search';

import SearchResults from './SearchResults';

/**
 * SearchBar component to render a search input with live results and form submission.
 *
 * This component provides a search functionality with debounced input handling,
 * live search results display, and form submission to navigate to search results page.
 * It integrates with Next.js router to update URL parameters and handle navigation.
 * @param   {object}      props             - Component properties
 * @param   {string}      props.placeholder - Placeholder text for the search input field
 * @returns {JSX.Element}                   JSX.Element representing the search bar with live results
 */
const SearchBar = ({ placeholder }: { placeholder: string }): JSX.Element => {
  /** Get current search parameters from URL */
  const searchParams = useSearchParams();
  /** Create mutable search parameters object */
  const params = new URLSearchParams(searchParams);
  /** Get current pathname for navigation */
  const pathname = usePathname();
  /** Get router instance for navigation */
  const router = useRouter();

  /** Track search dropdown active state */
  const [isSearchActive, setIsSearchActive] = useState(false);

  /** Get current search value from URL parameters */
  const searchValue = searchParams.get('search') || '';
  /** Debounce search value to limit API calls */
  const [debouncedValue] = useDebounce(searchValue, 300);

  /* Handle search input changes and update URL parameters */
  const handleSearch = (term: string) => {
    if (term) {
      /** Set search term in URL parameters */
      params.set('search', term);
      /** Activate search results dropdown */
      setIsSearchActive(true);
    } else {
      /** Remove search term from URL parameters */
      params.delete('search');
      /** Deactivate search results dropdown */
      setIsSearchActive(false);
    }
    /** Update URL with new search parameters */
    router.replace(`${pathname}?${params.toString()}`);
  };

  /* Handle form submission to navigate to search results page */
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    /** Prevent default form submission behavior */
    e.preventDefault();
    /** Navigate to services page with search parameters */
    router.replace(`/services?${params.toString()}`);
    /** Close search dropdown after navigation */
    setIsSearchActive(false);
  };

  /* Render search bar with input and results dropdown */
  return (
    <div className="relative text-neutral-600 max-2xl:hidden">
      {/** Search form with input and submit button */}
      <form className="flex w-full" onSubmit={handleSubmit}>
        {/** Search submit button with icon */}
        <button
          type="submit"
          className="group relative m-auto box-border flex shrink-0 flex-col p-2.5"
        >
          <span className="sr-only">{placeholder}</span>
          <SearchIcon />
        </button>
        {/** Search input field with debounced value and change handler */}
        <input
          data-testid="header-search-input"
          defaultValue={debouncedValue}
          onChange={(e) => handleSearch(e.target.value)}
          type="search"
          placeholder={placeholder}
          id="searchInput"
          name="quick-search"
          className="my-auto h-6.25 w-52.5 rounded-xl border border-solid border-gray-200 px-2.5 text-neutral-400 transition-colors duration-300 ease-in-out outline-none focus:border-none focus:ring-1 focus:ring-fuchsia-500 focus:outline-none"
          aria-label={placeholder}
        />
      </form>
      {/** Suspense wrapper for search results with fallback */}
      <Suspense fallback={'...'}>
        <SearchResults
          searchValue={debouncedValue}
          state={isSearchActive}
          setState={setIsSearchActive}
        />
      </Suspense>
    </div>
  );
};

export default SearchBar;
