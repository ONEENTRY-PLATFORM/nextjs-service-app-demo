import type { JSX } from 'react';

/**
 * StatsStrip component — the pink→cyan gradient counters strip right under
 * the services page hero, as in the static-html mock (`PricesPage.tsx`).
 * @param   {object}                           props       - Component properties
 * @param   {Array<[string | number, string]>} props.stats - Pairs of [value, label], rendered in a 3-column grid
 * @returns {JSX.Element}                                  Gradient strip with the counters
 */
const StatsStrip = ({
  stats,
}: {
  stats: Array<[string | number, string]>;
}): JSX.Element => {
  return (
    <div className="bg-gradient-stats">
      <div className="mx-auto grid max-w-7xl grid-cols-3 gap-2 px-3 py-4 text-center text-white md:px-8">
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
