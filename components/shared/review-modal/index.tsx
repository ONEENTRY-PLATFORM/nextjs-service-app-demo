'use client';

import type { JSX } from 'react';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { useDict } from '@/app/store/providers/useDict';
import CloseButton from '@/components/shared/CloseButton';
import DialogPortal from '@/components/shared/DialogPortal';
import { useDialogA11y } from '@/components/shared/useDialogA11y';
import { dictText } from '@/components/utils/dictText';

import PhotoRow from './components/PhotoRow';
import StarPicker from './components/StarPicker';

/**
 * ReviewModal — the "leave a review" dialog: purple→pink gradient header, 5-star hover picker, up to
 * 5 photo thumbnails, a pink-bordered textarea and a gradient Confirm button
 * enabled once a rating and some text are set.
 *
 * Client-side only, exactly like the mock: the CMS reviews storage is not
 * populated yet, so confirming thanks the visitor with a toast and closes.
 * @param   {object}      props         - Component properties
 * @param   {() => void}  props.onClose - Close handler
 * @returns {JSX.Element}               JSX.Element representing the review modal
 */
const ReviewModal = ({ onClose }: { onClose: () => void }): JSX.Element => {
  const dict = useDict();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  /** Dialog a11y: focus trap/restore, scroll lock and Escape → close. */
  const dialogRef = useDialogA11y({ isOpen: true, onClose });

  /** Confirm unlocks once a rating and non-empty text are provided */
  const ready = rating > 0 && text.trim().length > 0;

  /** Thank the visitor and close (no persistence — parity with the mock) */
  const handleConfirm = () => {
    if (!ready) {
      return;
    }
    toast(
      dictText(dict, 'review_thank_you_toast', 'Thank you for your review!'),
    );
    onClose();
  };

  return (
    <DialogPortal>
      <div
        ref={dialogRef}
        data-testid="review-modal"
        role="dialog"
        aria-modal="true"
        aria-label={dictText(dict, 'leave_review_text', 'Leave a review')}
        className="fixed inset-0 z-300 flex items-center justify-center p-4"
        style={{
          background: 'rgba(20,0,30,0.55)',
          backdropFilter: 'blur(6px)',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white"
          style={{ boxShadow: '0 32px 80px rgba(180,40,220,0.30)' }}
        >
          {/* Gradient header (purple → pink, as the auth modal) */}
          <div
            className="relative px-5 pt-8 pb-7 md:px-8"
            style={{
              background: 'linear-gradient(135deg,#9B4FB2 0%,#ed21f1 100%)',
            }}
          >
            <h2 className="text-[2rem] font-light text-white">
              {dictText(dict, 'reviews_label', 'Reviews')}
            </h2>
            <CloseButton onClose={onClose} className="absolute top-5 right-5" />
          </div>

          {/* Body */}
          <div className="flex flex-col gap-5 overflow-y-auto px-5 py-7 md:px-8">
            <p className="text-base text-slate-400">
              {dictText(
                dict,
                'review_prompt_text',
                'Please leave a review about your visit',
              )}
            </p>

            <StarPicker rating={rating} onRate={setRating} />

            <PhotoRow photos={photos} onChange={setPhotos} />

            {/* Review text */}
            <div className="rounded-2xl border-[1.5px] border-fuchsia-500 px-4 py-3">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={dictText(
                  dict,
                  'review_placeholder',
                  'Tell us about your visit…',
                )}
                rows={5}
                className="w-full resize-none bg-transparent text-base text-slate-400 outline-none placeholder:opacity-70"
              />
            </div>

            {/* Confirm */}
            <button
              onClick={handleConfirm}
              disabled={!ready}
              className={
                'w-full rounded-full py-4 text-base font-bold tracking-widest uppercase transition-all ' +
                (ready
                  ? 'bg-gradient-brand text-white shadow-[0_10px_24px_rgba(237,33,241,0.27)] hover:scale-102 active:scale-97'
                  : 'cursor-not-allowed bg-slate-50 text-neutral-300')
              }
            >
              {dictText(dict, 'confirm_text', 'Confirm')}
            </button>
          </div>
        </div>
      </div>
    </DialogPortal>
  );
};

export default ReviewModal;
