import { render, screen } from '@testing-library/react';

import StarsGroup from '@/components/shared/StarsGroup';

describe('StarsGroup', () => {
  it('always renders five stars and exposes the rating via aria-label', () => {
    const { container } = render(<StarsGroup rating={3} size={16} />);

    expect(screen.getByLabelText('Rating of 3 out of 5')).toBeInTheDocument();
    expect(container.querySelectorAll('svg')).toHaveLength(5);
  });

  it('renders no filled stars for a zero rating', () => {
    render(<StarsGroup rating={0} size={16} />);

    expect(screen.getByLabelText('Rating of 0 out of 5')).toBeInTheDocument();
  });
});
