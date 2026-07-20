import type { JSX } from 'react';

/**
 * StatsStrip component — the pink→cyan gradient counters strip right under
 * the services page hero, as in the static-html mock (`PricesPage.tsx`).
 * @param   {object}                           props       - Component properties
 * @param   {Array<[string | number, string]>} props.stats - Pairs of [value, label], one grid column each
 * @returns {JSX.Element}                                  Gradient strip with the counters
 */
const StatsStrip = ({
  stats,
}: {
  stats: Array<[string | number, string]>;
}): JSX.Element => {
  /** Counters can be dropped when the CMS has no data behind them. */
  const columns = stats.length >= 3 ? 'grid-cols-3' : 'grid-cols-2';

  return (
    <div className="bg-gradient-stats">
      <div
        className={`mx-auto grid max-w-7xl ${columns} gap-2 px-3 py-4 text-center text-white md:px-8`}
      >
        {stats.map(([value, label]) => (
          <div key={label} className="py-1">
            <p className="text-xl font-black">{value}</p>
            <p className="text-sm tracking-wider text-white/70 uppercase">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsStrip;
