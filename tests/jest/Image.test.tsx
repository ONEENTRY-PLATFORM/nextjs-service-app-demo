import { fireEvent, render, screen } from '@testing-library/react';

import Image from '@/components/shared/Image';

describe('shared/Image', () => {
  it('renders the main image with src and alt', () => {
    render(<Image src="/img/main.jpg" alt="Main" />);

    const img = screen.getByRole('img', { name: 'Main' });
    expect(img).toHaveAttribute('src', '/img/main.jpg');
  });

  it('renders a blur placeholder image when placeholder is set', () => {
    const { container } = render(
      <Image
        src="/img/main.jpg"
        alt="Main"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,xyz"
      />,
    );

    const images = container.querySelectorAll('img');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('src', 'data:image/jpeg;base64,xyz');
    expect(images[0]).toHaveAttribute('aria-hidden', 'true');
  });

  it('hides the placeholder after the main image loads', () => {
    const { container } = render(
      <Image
        src="/img/main.jpg"
        alt="Main"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,xyz"
      />,
    );

    const [placeholderImg, mainImg] = Array.from(
      container.querySelectorAll('img'),
    );
    fireEvent.load(mainImg as HTMLImageElement);

    expect(placeholderImg?.classList.contains('opacity-0')).toBe(true);
  });

  it('calls onClick and does not crash when the handler is omitted', () => {
    const onClick = jest.fn();
    const { rerender } = render(
      <Image src="/img/main.jpg" alt="Main" onClick={onClick} />,
    );

    fireEvent.click(screen.getByRole('img', { name: 'Main' }));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(<Image src="/img/main.jpg" alt="Main" />);
    expect(() =>
      fireEvent.click(screen.getByRole('img', { name: 'Main' })),
    ).not.toThrow();
  });
});
