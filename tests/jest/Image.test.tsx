import { fireEvent, render, screen } from '@testing-library/react';

import Image from '@/components/shared/Image';

/**
 * `shared/Image` delegates to `next/image`, so these assert the wrapper's own
 * contract — the positioned box, its layout classes and the props handed down —
 * rather than next/image's internals. The component used to hand-roll a second
 * `<img>` as the LQIP layer and fade it out on load; that layer is gone (the
 * blur is now next/image's, rendered as a background on the single `<img>`).
 */
describe('shared/Image', () => {
  it('renders one image with the alt text and passes the source down', () => {
    const { container } = render(<Image src="/img/main.jpg" alt="Main" />);

    const images = container.querySelectorAll('img');
    expect(images).toHaveLength(1);

    /** next/image rewrites src through the optimizer, so match the encoded path. */
    const img = screen.getByRole('img', { name: 'Main' });
    expect(img.getAttribute('src')).toContain(
      encodeURIComponent('/img/main.jpg'),
    );
  });

  /**
   * next/image paints the LQIP as `background-image: url("data:image/svg+xml,…")`
   * on the `<img>` itself, but jsdom's CSS parser drops that declaration, so the
   * data URI cannot be asserted here (it IS verified end-to-end against the
   * server-rendered HTML). The sibling `background-size/position/repeat`
   * declarations survive and are emitted only for the placeholder — they are the
   * reliable in-jsdom signal that it was applied.
   */
  it('applies the blur placeholder when an LQIP is supplied', () => {
    const { container } = render(
      <Image
        src="/img/main.jpg"
        alt="Main"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,xyz"
      />,
    );

    expect(container.querySelector('img')?.getAttribute('style')).toContain(
      'background-size: cover',
    );
  });

  it('omits the blur placeholder when no LQIP is supplied', () => {
    const { container } = render(
      <Image src="/img/main.jpg" alt="Main" placeholder="blur" />,
    );

    /** `placeholder="blur"` without a blurDataURL would throw in next/image. */
    expect(container.querySelector('img')?.getAttribute('style')).not.toContain(
      'background-size',
    );
  });

  it('keeps the wrapper relative by default and yields to a positioned className', () => {
    const { container: plain } = render(<Image src="/img/main.jpg" alt="" />);
    expect(plain.firstElementChild?.className).toContain('relative');

    /**
     * A caller stretching the wrapper itself (`absolute inset-0`) must not get
     * `relative` on top — it would win the cascade and collapse the fill box.
     */
    const { container: positioned } = render(
      <Image src="/img/main.jpg" alt="" className="absolute inset-0" />,
    );
    expect(positioned.firstElementChild?.className).not.toContain('relative');
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
