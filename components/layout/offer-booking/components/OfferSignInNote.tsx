import type { JSX } from 'react';

import { useDict } from '@/app/store/providers/useDict';
import { dictText } from '@/components/utils/dictText';

/**
 * OfferSignInNote — the tinted note of the summary step shown to signed-out
 * clients: booking needs an account, the footer button opens the sign-in
 * popup.
 * @param   {object}      props        - Component properties
 * @param   {string}      props.accent - Accent colour of the offer
 * @returns {JSX.Element}              Sign-in note
 */
const OfferSignInNote = ({ accent }: { accent: string }): JSX.Element => {
  const dict = useDict();

  return (
    <div
      className="rounded-2xl p-4 text-center"
      style={{ background: `${accent}10`, border: `1px solid ${accent}33` }}
      data-testid="offer-signin-note"
    >
      <p className="text-base font-semibold text-slate-400">
        {dictText(
          dict,
          'offer_sign_in_title',
          'Sign in to confirm your booking',
        )}
      </p>
      <p className="mt-1 text-sm text-neutral-300">
        {dictText(
          dict,
          'offer_sign_in_desc',
          'Please sign in or create an account to complete the booking.',
        )}
      </p>
    </div>
  );
};

export default OfferSignInNote;
