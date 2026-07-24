'use client';

import type { Dispatch, JSX, SetStateAction } from 'react';
import { useMemo } from 'react';

import { useGetAdminsQuery } from '@/app/api/api/RTKApi';
import { useSearchProducts } from '@/app/api/hooks/useSearchProducts';
import { useDict } from '@/app/store/providers/useDict';
import Spinner from '@/components/shared/Spinner';
import { isOfferProduct } from '@/components/utils/isOfferProduct';

import { adminAttr } from './adminAttr';
import ProductRow from './ProductRow';
import SpecialistRow from './SpecialistRow';

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
  /** UI-text dictionary for the localized section titles and empty state */
  const dict = useDict();
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

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  /** Services rows exclude special-offer products (rendered separately). */
  const services = products.filter((product) => !isOfferProduct(product));
  const hasResults = specialists.length > 0 || services.length > 0;

  /**
   * Only show the empty state once there is an actual query — otherwise
   * "Nothing found" flashes before/without a search term.
   */
  if (!hasResults) {
    return searchValue ? (
      <p
        data-testid="search-empty"
        className="px-5 py-8 text-center text-sm text-neutral-300"
      >
        {(
          (dict?.search_nothing_found_text?.value as string | undefined) ||
          'Nothing found for “%q%”.'
        ).replace('%q%', searchValue)}
      </p>
    ) : (
      <></>
    );
  }

  return (
    <div data-testid="search-results" className="py-2">
      {specialists.length > 0 && (
        <div className="py-1">
          <p className="px-5 py-1.5 text-sm font-black tracking-widest text-neutral-300 uppercase">
            {(dict?.specialists_text?.value as string | undefined) ||
              'Specialists'}
          </p>
          {specialists.map((admin) => (
            <SpecialistRow key={admin.id} admin={admin} setOpen={setOpen} />
          ))}
        </div>
      )}

      {services.length > 0 && (
        <div className="py-1">
          <p className="px-5 py-1.5 text-sm font-black tracking-widest text-neutral-300 uppercase">
            {(dict?.services_text?.value as string | undefined) || 'Services'}
          </p>
          {/* Each row resolves (and caches) its own catalog page — see ProductRow. */}
          {services.map((product) => {
            const pageId = product.productPages?.[0]?.pageId;
            if (!pageId) {
              return null;
            }
            return (
              <ProductRow
                key={product.id}
                pageId={pageId}
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

export default SearchResultsList;
