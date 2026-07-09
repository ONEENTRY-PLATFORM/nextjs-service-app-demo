import { render, screen } from '@testing-library/react';

import BookingCardDate from '@/components/forms/booking-form/payment/BookingCardDate';

describe('BookingCardDate', () => {
  it('renders the appointment date and time in separate <time> elements', () => {
    // Local time (no Z suffix) so the assertion is timezone-independent
    render(<BookingCardDate date={new Date('2026-07-10T14:30:00')} />);

    expect(screen.getByText('2026-07-10')).toBeInTheDocument();
    expect(screen.getByText('14:30')).toBeInTheDocument();
  });
});
