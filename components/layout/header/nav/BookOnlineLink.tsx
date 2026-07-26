import Link from 'next/link';
import type { IAttributeValues } from 'oneentry/dist/base/utils';
import type { JSX } from 'react';

import { ServerProvider } from '@/app/store/providers/ServerProvider';

/**
 * BookOnlineLink — the gradient "Book Online" pill.
 *
 * The mock renders two separate buttons: a compact one centered in the header
 * row on mobile (`md:hidden`, py-3/text-sm, 14px shadow) and a larger one
 * inside the right actions group on md+ (`hidden md:block`, py-3.5/text-base,
 * 16px shadow). `variant` picks which of the two spots is rendered so both
 * share markup and the dictionary text.
 * @param   {object}               props         - Component properties
 * @param   {'mobile' | 'desktop'} props.variant - Which mock button to render
 * @returns {JSX.Element}                        JSX.Element representing the booking link
 */
const BookOnlineLink = ({
  variant,
}: {
  variant: 'mobile' | 'desktop';
}): JSX.Element => {
  /** Fetch dictionary data for localization */
  const [dict] = ServerProvider<IAttributeValues>('dict');
  const { book_text } = dict;

  return (
    <Link
      href="/booking/"
      data-testid="book-online-link"
      data-variant={variant}
      className={
        'rounded-xl bg-gradient-brand font-bold tracking-wide whitespace-nowrap text-white uppercase transition-transform duration-200 outline-none focus:outline-none active:scale-97 ' +
        (variant === 'mobile'
          ? 'px-4 py-3 text-sm shadow-[0_4px_14px_rgba(237,33,241,0.27)] md:hidden'
          : 'hidden px-6 py-3.5 text-base shadow-[0_4px_16px_rgba(237,33,241,0.27)] hover:scale-104 md:block')
      }
    >
      {(book_text?.value as string | undefined) || 'Book Online'}
    </Link>
  );
};

export default BookOnlineLink;
