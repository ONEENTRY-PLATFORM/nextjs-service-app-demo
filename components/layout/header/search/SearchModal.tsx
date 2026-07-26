'use client';

import { Search, X } from 'lucide-react';
import type { JSX } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { useDict } from '@/app/store/providers/useDict';

import SearchResultsList from './SearchResultsList';

/**
 * Header search — icon button that opens a search popup:
 * dimmed blurred backdrop, white panel with
 * the search input, live results ({@link SearchResultsList}) and a pink accent
 * strip at the bottom.
 * @param   {object}      props             - Component properties
 * @param   {string}      props.placeholder - Placeholder text for the search input field
 * @returns {JSX.Element}                   JSX.Element representing the search icon and popup
 */
const SearchModal = ({ placeholder }: { placeholder: string }): JSX.Element => {
  /** UI-text dictionary for the localized empty-state copy and aria-label */
  const dict = useDict();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState('');
  const [debouncedTerm] = useDebounce(term.trim(), 300);
  const inputRef = useRef<HTMLInputElement>(null);

  /** Focus the input and close on Escape while the popup is open */
  useEffect(() => {
    if (!open) {
      return;
    }
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => {
    setOpen(false);
    setTerm('');
  };

  return (
    <>
      {/* Search icon button */}
      <button
        onClick={() => setOpen(true)}
        aria-label={placeholder}
        data-testid="header-search-open"
        className="hidden rounded-lg p-2 text-neutral-400 transition-colors hover:bg-gray-100 lg:flex"
      >
        <Search size={18} />
      </button>

      {/* Popup */}
      {open && (
        <div
          className="fixed inset-0 z-500 flex items-start justify-center bg-[rgba(20,0,30,0.55)] px-4 pt-24 backdrop-blur-[6px]"
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-slate-150 px-5 py-4">
              <Search size={20} className="text-fuchsia-500" />
              <input
                ref={inputRef}
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder={placeholder}
                data-testid="header-search-input"
                className="flex-1 bg-transparent text-base text-slate-400 outline-none"
              />
              <button
                onClick={close}
                aria-label={
                  (dict?.close_search_aria?.value as string | undefined) ||
                  'Close search'
                }
                className="rounded-lg p-1.5 text-neutral-300 transition-colors hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {!debouncedTerm ? (
                <p className="px-5 py-8 text-center text-sm text-neutral-300">
                  {(dict?.search_start_typing_text?.value as
                    string | undefined) ||
                    'Start typing to find a service or a specialist.'}
                </p>
              ) : (
                <SearchResultsList
                  searchValue={debouncedTerm}
                  setOpen={setOpen}
                />
              )}
            </div>

            {/* Accent strip */}
            <div className="h-1 bg-linear-90 from-accent-pink-bright to-accent-pink" />
          </div>
        </div>
      )}
    </>
  );
};

export default SearchModal;
