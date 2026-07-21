'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { JSX } from 'react';

import RevealAnimations from '@/app/animations/RevealAnimations';

import BookingSummary from './components/BookingSummary';
import DateTimeStep from './components/DateTimeStep';
import EntryScreen from './components/EntryScreen';
import SalonStep from './components/SalonStep';
import ServiceStep from './components/ServiceStep';
import SpecialistStep from './components/SpecialistStep';
import StepBar from './components/StepBar';
import SuccessModal from './components/SuccessModal';
import { BRAND_GRADIENT, MUTED, PINK } from './constants';
import { scrollToBookingTop } from './scrollToBookingTop';
import type { BookingData } from './types';
import { useBookingWizard } from './useBookingWizard';

/**
 * BookingWizard — the interactive booking flow ported from the static-html
 * mock (`BookingPage.tsx` → `BookingPage`): an entry screen with two flows
 * (studio-first / specialist-first), a step bar, the four wizard steps with
 * cross-filtering between studio / service / specialist, the "Your
 * Appointment" summary (right column on desktop, a separate screen on
 * mobile) and the success modal.
 *
 * All state, cross-filters and handlers live in {@link useBookingWizard}; this
 * component is the render only. A selection stashed in the booking cart (a
 * "Book" button elsewhere in the app, or a "repeat" action in the profile)
 * preselects the matching entities and fast-forwards the wizard.
 * @param   {object}      props      - Component properties
 * @param   {BookingData} props.data - Salons, services and specialists from the CMS
 * @returns {JSX.Element}            Booking wizard
 */
const BookingWizard = ({ data }: { data: BookingData }): JSX.Element => {
  const {
    flow,
    stepKeys,
    stepIdx,
    currentStepKey,
    mobileSummary,
    setMobileSummary,
    categories,
    categoryFilter,
    salons,
    filteredSalons,
    filteredServices,
    filteredMasters,
    salon,
    selectedServiceIds,
    master,
    date,
    time,
    slots,
    hasSchedule,
    durationMinutes,
    closeMinutes,
    salonObj,
    serviceObjs,
    masterObj,
    masterAny,
    canNext,
    isLastStep,
    booked,
    isAuth,
    isLoading,
    error,
    paymentAccounts,
    paymentAccount,
    selectPaymentAccount,
    startFlow,
    selectSalon,
    selectService,
    selectMaster,
    clearService,
    handleNext,
    handleBack,
    handleConfirm,
    resetFlow,
    handleCloseSuccess,
    goStep,
    onCategoryChange,
    onDate,
    onTime,
  } = useBookingWizard(data);

  return (
    <section
      id="booking-section"
      data-testid="booking-page"
      className="flex-1 py-6 xl:pb-12 md:py-12 md:pb-20"
      style={{
        background: 'linear-gradient(180deg,#f7f7fb 0%,#fff 60%)',
        /* Steps differ in height: without this the browser's scroll anchoring
           yanks the page before `scrollToBookingTop` runs */
        overflowAnchor: 'none',
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-3 md:px-8">
        {flow && (
          <div className="mb-6 md:mb-10">
            <StepBar steps={stepKeys} currentIdx={stepIdx} onGo={goStep} />
          </div>
        )}
        <div className="grid grid-cols-1 items-stretch gap-8 xl:grid-cols-3">
          <div
            className={`h-full xl:col-span-2 xl:block ${mobileSummary ? 'hidden' : ''}`}
          >
            <div
              className="-mx-3 flex h-full flex-col rounded-none bg-white px-4 py-6 md:mx-0 md:rounded-3xl md:p-8"
              style={{ boxShadow: '0 4px 40px rgba(237,33,241,0.08)' }}
            >
              <RevealAnimations
                className="flex-1"
                key={flow ? `${flow}-${currentStepKey}` : 'entry'}
              >
                {!flow && <EntryScreen onChoose={startFlow} />}
                {flow && currentStepKey === 'salon' && (
                  <SalonStep
                    salons={filteredSalons}
                    selected={salon}
                    onSelect={selectSalon}
                  />
                )}
                {flow && currentStepKey === 'service' && (
                  <ServiceStep
                    services={filteredServices}
                    selectedIds={selectedServiceIds}
                    onToggle={selectService}
                  />
                )}
                {flow && currentStepKey === 'specialist' && (
                  <SpecialistStep
                    masters={filteredMasters}
                    selected={master}
                    onSelect={selectMaster}
                    allowAny
                    services={serviceObjs}
                    onClearService={clearService}
                    categories={categories}
                    categoryFilter={categoryFilter}
                    onCategoryChange={onCategoryChange}
                    salons={salons}
                    selectedSalon={salonObj}
                  />
                )}
                {flow && currentStepKey === 'datetime' && (
                  <DateTimeStep
                    selectedDate={date}
                    selectedTime={time}
                    onDate={onDate}
                    onTime={onTime}
                    slots={slots}
                    hasSchedule={hasSchedule}
                    durationMinutes={durationMinutes}
                    closeMinutes={closeMinutes}
                  />
                )}
              </RevealAnimations>
              {flow && (
                <div className="mt-auto flex items-stretch gap-3 pt-8">
                  <button
                    onClick={handleBack}
                    data-testid="booking-back"
                    className="flex items-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold tracking-wider uppercase transition-all hover:opacity-80 md:text-base"
                    style={{ background: '#f7f7fb', color: MUTED }}
                  >
                    <ChevronLeft size={16} />{' '}
                    {stepIdx === 0 ? 'Change start' : 'Back'}
                  </button>
                  {!isLastStep && (
                    <button
                      onClick={handleNext}
                      disabled={!canNext}
                      data-testid="booking-continue"
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold tracking-wider uppercase transition-all enabled:hover:scale-102 enabled:active:scale-98 md:text-base"
                      style={{
                        background: canNext ? BRAND_GRADIENT : '#f7f7fb',
                        color: canNext ? '#fff' : MUTED,
                        boxShadow: canNext ? `0 6px 20px ${PINK}44` : 'none',
                        cursor: canNext ? 'pointer' : 'not-allowed',
                      }}
                    >
                      Continue <ChevronRight size={16} />
                    </button>
                  )}
                  {/* Mobile: on the last step Continue leads to the summary */}
                  {isLastStep && (
                    <button
                      onClick={() => {
                        setMobileSummary(true);
                        scrollToBookingTop();
                      }}
                      disabled={!time}
                      data-testid="booking-summary-open"
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold tracking-wider uppercase transition-all enabled:hover:scale-102 enabled:active:scale-98 xl:hidden md:text-base"
                      style={{
                        background: time ? BRAND_GRADIENT : '#f7f7fb',
                        color: time ? '#fff' : MUTED,
                        boxShadow: time ? `0 6px 20px ${PINK}44` : 'none',
                        cursor: time ? 'pointer' : 'not-allowed',
                      }}
                    >
                      Continue <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile: summary is a separate screen reached via Continue.
              Desktop: always in the right column. */}
          <div
            className={`h-full xl:col-span-1 xl:block ${
              flow && isLastStep && mobileSummary ? '' : 'hidden'
            }`}
          >
            <button
              onClick={() => {
                setMobileSummary(false);
                scrollToBookingTop();
              }}
              className="mb-4 flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold tracking-wider uppercase xl:hidden"
              style={{ background: '#f7f7fb', color: MUTED }}
            >
              <ChevronLeft size={16} /> Back
            </button>
            {/* Desktop: the summary follows the long steps down the page,
                pinned under the fixed header (`h-20`) */}
            <div className="xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
              <BookingSummary
                flow={flow}
                salon={salonObj}
                services={serviceObjs}
                master={masterObj}
                masterAny={masterAny}
                date={date}
                time={time}
                currentIdx={stepIdx}
                totalSteps={stepKeys.length}
                paymentAccounts={paymentAccounts}
                paymentAccount={paymentAccount}
                onSelectPaymentAccount={selectPaymentAccount}
                onBook={handleConfirm}
                isLoggedIn={isAuth}
                isLoading={isLoading}
                error={error}
                onReset={resetFlow}
              />
            </div>
          </div>
        </div>
      </div>

      {booked && <SuccessModal onClose={handleCloseSuccess} />}
    </section>
  );
};

export default BookingWizard;
