import { render, screen } from '@testing-library/react';

import ReviewSlide from '@/components/layout/reviews-carousel/components/ReviewSlide';

describe('ReviewSlide', () => {
  it('renders the review title, text and star rating', () => {
    render(
      <ReviewSlide
        item={{ title: 'Great salon', text: 'Loved the haircut!', rating: 4 }}
        setState={jest.fn()}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Great salon' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Loved the haircut!')).toBeInTheDocument();
    expect(screen.getByLabelText('Rating of 4 out of 5')).toBeInTheDocument();
  });
});
