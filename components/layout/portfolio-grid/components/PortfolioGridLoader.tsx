import type { JSX } from 'react';

/**
 * PortfolioGridLoader — Suspense skeleton for the master's portfolio section.
 *
 * Mirrors PortfolioGridLayout/PortfolioGallery exactly (heading block, then the
 * `grid-cols-2 / sm:3 / lg:5` grid of `aspect-4/5` rounded cells with the same
 * gaps and padding), so replacing the skeleton with the real grid does not shift
 * the layout.
 * @returns {JSX.Element} Portfolio skeleton
 */
const PortfolioGridLoader = (): JSX.Element => {
  return (
    <section className="bg-white pb-4">
      {/* Heading placeholder — same box as the real "Portfolio" title */}
      <div className="mx-auto flex max-w-7xl flex-col items-center p-3 md:px-8 md:py-6">
        <div
          className="h-6 w-32 animate-pulse rounded bg-slate-150"
          style={{ fontSize: 'clamp(1.1rem, 2.2vw, 1.65rem)' }}
        />
      </div>
      {/* Grid placeholder — identical classes to PortfolioGallery */}
      <div className="grid grid-cols-2 gap-3 px-3 pb-4 sm:grid-cols-3 md:gap-4 md:px-6 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_card, index) => (
          <div
            key={index}
            className="aspect-4/5 animate-pulse rounded-2xl bg-slate-150"
          />
        ))}
      </div>
    </section>
  );
};

export default PortfolioGridLoader;
