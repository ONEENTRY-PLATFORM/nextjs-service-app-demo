'use client';

import { ArrowUpRight, Search, UserCircle, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { IAdminEntity } from 'oneentry/dist/admins/adminsInterfaces';
import type { IPagesEntity } from 'oneentry/dist/pages/pagesInterfaces';
import type { Dispatch, JSX, SetStateAction } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { getPageById, useGetAdminsQuery } from '@/app/api';
import { useSearchProducts } from '@/app/api/hooks/useSearchProducts';
import Spinner from '@/components/shared/Spinner';

import ProductRow from './ProductRow';

/**
 * Extract a string attribute value from an admin entity.
 * @param   {IAdminEntity} admin  - Admin (master) entity
 * @param   {string}       marker - Attribute marker
 * @returns {string}              Attribute value or empty string
 */
const adminAttr = (admin: IAdminEntity, marker: string): string =>
  (admin.attributeValues?.[marker]?.value as string | undefined) ?? '';

/**
 * Single specialist row in the search popup — photo, name, role and an
 * arrow, as in the static-html mock.
 * @param   {object}                            props         - Component properties
 * @param   {IAdminEntity}                      props.admin   - Admin (master) entity to display
 * @param   {Dispatch<SetStateAction<boolean>>} props.setOpen - Popup visibility setter
 * @returns {JSX.Element}                                     Specialist row
 */
const SpecialistRow = ({
  admin,
  setOpen,
}: {
  admin: IAdminEntity;
  setOpen: Dispatch<SetStateAction<boolean>>;
}): JSX.Element => {
  const name = adminAttr(admin, 'master_name');
  const role = adminAttr(admin, 'master_short_description');
  const photoArr = admin.attributeValues?.master_image?.value as
    Array<{ downloadLink?: string }> | undefined;
  const photo = photoArr?.[0]?.downloadLink;

  return (
    <Link
      prefetch={false}
      href={`/masters/${admin.id}`}
      onClick={() => setOpen(false)}
      className="flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-gray-50"
    >
      {photo ? (
        <Image
          src={photo}
          width={36}
          height={36}
          alt={name}
          className="size-9 shrink-0 rounded-full object-cover object-top"
        />
      ) : (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-fuchsia-500/10">
          <UserCircle size={18} className="text-fuchsia-500" />
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate text-base font-semibold text-slate-400">
          {name}
        </span>
        <span className="block truncate text-base text-fuchsia-500">
          {role}
        </span>
      </span>
      <ArrowUpRight size={14} className="ml-auto shrink-0 text-neutral-300" />
    </Link>
  );
};

/**
 * Live search results for the search popup: Specialists (masters filtered by
 * name/role) and Services (products found by the search term) — two sections,
 * as in the static-html mock.
 * @param   {object}                            props             - Component properties
 * @param   {string}                            props.searchValue - Debounced search term
 * @param   {Dispatch<SetStateAction<boolean>>} props.setOpen     - Popup visibility setter (closes the popup on row click)
 * @returns {JSX.Element}                                         JSX.Element with the results list
 */
const SearchResultsList = ({
  searchValue,
  setOpen,
}: {
  searchValue: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
}): JSX.Element => {
  /** State to store page data associated with products */
  const [pages, setPages] = useState<{
    [key: number]: {
      page?: IPagesEntity;
    };
  }>({});
  /** Fetch products based on search value using custom hook */
  const { loading, products } = useSearchProducts({ name: searchValue });
  /** All masters — cached by RTK Query, filtered locally by the search term */
  const { data: admins } = useGetAdminsQuery();

  /** Specialists whose name or role matches the search term */
  const specialists = useMemo(() => {
    if (!admins) {
      return [];
    }
    const query = searchValue.toLowerCase();
    return admins
      .filter((admin) => {
        const name = adminAttr(admin, 'master_name');
        const role = adminAttr(admin, 'master_short_description');
        return (
          name &&
          (name.toLowerCase().includes(query) ||
            role.toLowerCase().includes(query))
        );
      })
      .slice(0, 6);
  }, [admins, searchValue]);

  /** Effect to fetch page data for products when products change */
  useEffect(() => {
    const fetchPages = async () => {
      const pagesData: {
        [key: number]: {
          page?: IPagesEntity;
        };
      } = {};
      await Promise.all(
        products.map(async (product) => {
          const firstPage = product.productPages?.[0];
          if (firstPage) {
            pagesData[product.id] = await getPageById(firstPage.pageId);
          }
        }),
      );
      setPages(pagesData);
    };

    if (products.length > 0) {
      fetchPages();
    }
  }, [products]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  /** Services rows exclude the auxiliary `service_product` entities */
  const services = products.filter(
    (product) => product.attributeSetIdentifier !== 'service_product',
  );
  const hasResults = specialists.length > 0 || services.length > 0;

  if (!hasResults) {
    return (
      <p className="px-5 py-8 text-center text-sm text-neutral-300">
        Nothing found for “{searchValue}”.
      </p>
    );
  }

  return (
    <div className="py-2">
      {specialists.length > 0 && (
        <div className="py-1">
          <p className="px-5 py-1.5 text-sm font-black tracking-widest text-neutral-300 uppercase">
            Specialists
          </p>
          {specialists.map((admin) => (
            <SpecialistRow key={admin.id} admin={admin} setOpen={setOpen} />
          ))}
        </div>
      )}

      {services.length > 0 && (
        <div className="py-1">
          <p className="px-5 py-1.5 text-sm font-black tracking-widest text-neutral-300 uppercase">
            Services
          </p>
          {services.map((product, i) => {
            const pageEntry = pages[product.id];
            if (!pageEntry) {
              return null;
            }
            return (
              <ProductRow
                key={product.id + i}
                pageData={pageEntry.page as IPagesEntity}
                product={product}
                setState={setOpen}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * Header search — icon button that opens a search popup, as in the
 * static-html mock (SearchModal): dimmed blurred backdrop, white panel with
 * the search input, live results and a pink accent strip at the bottom.
 * @param   {object}      props             - Component properties
 * @param   {string}      props.placeholder - Placeholder text for the search input field
 * @returns {JSX.Element}                   JSX.Element representing the search icon and popup
 */
const SearchModal = ({ placeholder }: { placeholder: string }): JSX.Element => {
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
                aria-label="Close search"
                className="rounded-lg p-1.5 text-neutral-300 transition-colors hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {!debouncedTerm ? (
                <p className="px-5 py-8 text-center text-sm text-neutral-300">
                  Start typing to find a service or a specialist.
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
