import { render, screen } from '@testing-library/react';

import AddressCard from '@/components/shared/AddressCard';

describe('AddressCard', () => {
  it('renders the address inside a semantic <address> element', () => {
    render(<AddressCard address="Dubai, Marina Walk 12" />);

    const address = screen.getByText('Dubai, Marina Walk 12');
    expect(address).toBeInTheDocument();
    expect(address.closest('address')).not.toBeNull();
  });
});
