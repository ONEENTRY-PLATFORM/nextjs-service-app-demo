'use client';

import type { JSX } from 'react';
import { useContext, useEffect, useRef, useState } from 'react';

import { OpenDrawerContext } from '@/app/store/providers/OpenDrawerContext';
import type { BookingData } from '@/components/layout/booking-page/types';
import { useAnimatedDialog } from '@/components/shared/useAnimatedDialog';

import OfferSwapAnimations from './animations/OfferSwapAnimations';
import OfferBookingDone from './components/OfferBookingDone';
import OfferBookingFooter from './components/OfferBookingFooter';
import OfferBookingHeader from './components/OfferBookingHeader';
import OfferPicksStep from './components/OfferPicksStep';
import OfferSummaryStep from './components/OfferSummaryStep';
import { useOfferBooking } from './hooks/useOfferBooking';
import type { OfferBookingInfo } from './types';

/**
 * How long the "Booking confirmed!" screen holds before the modal closes and
 * a real appointment routes to the profile (mock waits 1100 ms).
 */
const DONE_CLOSE_MS = 1600;

/**
 * OfferBookingModal — the two-step booking dialog a "Book Offer" button opens
 * (mock `OfferBookingModal.tsx`): the accent-gradient header with the package
 * summary, the salon / specialist / date & time picks, then the summary with
 * the confirm. Signed-out clients get the sign-in popup over the modal
 * instead of an order; confirmed bookings show the done screen, close with
 * the exit tween and route to the profile.
 *
 * Dismissal is suspended in three windows: while the sign-in popup is
 * stacked on top (both dialogs listen for Escape on `document` — one
 * keypress must not close both, and an out-of-order double close would leave
 * the body scroll-locked), while the order is in flight (closing then would
 * create the order silently and invite a duplicate booking) and while the
 * done screen holds (an early dismiss would cancel the profile routing).
 *
 * Render through `DialogPortal` — both "Book Offer" call sites sit inside
 * GSAP animation wrappers whose resting transform would otherwise trap this
 * `position: fixed` overlay.
 * @param   {object}           props         - Component properties
 * @param   {OfferBookingInfo} props.offer   - The offer being booked
 * @param   {BookingData}      props.data    - Salons / services / specialists from the CMS
 * @param   {() => void}       props.onClose - Unmount the modal
 * @returns {JSX.Element}                    Offer booking dialog
 */
const OfferBookingModal = ({
  offer,
  data,
  onClose,
}: {
  offer: OfferBookingInfo;
  data: BookingData;
  onClose: () => void;
}): JSX.Element => {
  const { open: drawerOpen } = useContext(OpenDrawerContext);
  const wizard = useOfferBooking({ offer, data });

  /**
   * Keeps the done screen on through the closing tween: `closeSuccess` flips
   * `booked` off before the exit plays, and without this latch the summary
   * step would flash mid-fade.
   */
  const [closing, setClosing] = useState(false);

  const dismissLocked = wizard.isLoading || drawerOpen || wizard.booked;

  /** Escape-path lock for the a11y hook — same rule as the pointer paths. */
  const escapeLockedRef = useRef(false);
  useEffect(() => {
    escapeLockedRef.current = dismissLocked;
  });

  const { dialogRef, contentRef, requestClose } = useAnimatedDialog({
    onClose,
    escapeLockedRef,
  });

  /**
   * Dismiss for the pointer paths (backdrop, header X) — ignored while
   * dismissal is suspended; see the component JSDoc for the three windows.
   * @returns {void}
   */
  const handleDismiss = (): void => {
    if (!dismissLocked) requestClose();
  };

  /**
   * The done screen holds for a beat, then the modal routes a real
   * appointment to the profile and plays the exit tween. `closeSuccess` runs
   * first so the navigation starts even though the timer's owner is about to
   * unmount; `requestClose` is deliberately the raw animated closer — the
   * dismissal lock guards user paths, not this programmatic one.
   */
  useEffect(() => {
    if (!wizard.booked) return;
    const timer = setTimeout(() => {
      setClosing(true);
      wizard.closeSuccess();
      requestClose();
    }, DONE_CLOSE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wizard.booked]);

  const showDone = wizard.booked || closing;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={offer.name}
      data-testid="offer-booking-modal"
      className="fixed inset-0 z-300 flex items-center justify-center p-4"
      style={{
        background: 'rgba(20,0,30,0.55)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismiss();
      }}
    >
      <div
        ref={contentRef}
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white"
        style={{ boxShadow: '0 32px 80px rgba(180,40,220,0.30)' }}
      >
        <OfferBookingHeader
          offer={offer}
          step={wizard.step}
          onClose={handleDismiss}
        />

        <div className="flex-1 overflow-y-auto px-7 py-6">
          {showDone ? (
            <OfferBookingDone accentGrad={offer.accentGrad} />
          ) : (
            <OfferSwapAnimations
              swapKey={`step-${wizard.step}`}
              dx={wizard.step === 1 ? -16 : 16}
            >
              {wizard.step === 1 ? (
                <OfferPicksStep
                  wizard={wizard}
                  salons={data.salons}
                  accent={offer.accentColor}
                />
              ) : (
                <OfferSummaryStep wizard={wizard} offer={offer} />
              )}
            </OfferSwapAnimations>
          )}
        </div>

        {!showDone && <OfferBookingFooter wizard={wizard} offer={offer} />}
      </div>
    </div>
  );
};

export default OfferBookingModal;
