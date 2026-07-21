'use client';

import type { JSX } from 'react';

import type { RequestResult, TableFilter, TableSort } from '../types';
import ResultsTableRow from './ResultsTableRow';
import Th from './Th';

const SORTS: readonly TableSort[] = ['order', 'slowest', 'fastest'];
const FILTERS: readonly TableFilter[] = ['all', 'ok', 'failed'];

/**
 * ResultsTable — the per-request details table with its sort and filter pills.
 *
 * The `#` column keeps the ORIGINAL probe index even when rows are reordered,
 * so a row can always be traced back to its position in the run and matched
 * against the bar chart. Every header carries a tooltip explaining its column.
 * @param   {object}                        props                - Component props.
 * @param   {RequestResult[]}               props.rows           - Rows after sorting and filtering.
 * @param   {TableSort}                     props.sort           - Active ordering.
 * @param   {TableFilter}                   props.filter         - Active row filter.
 * @param   {(sort: TableSort) => void}     props.onSortChange   - Change the ordering.
 * @param   {(filter: TableFilter) => void} props.onFilterChange - Change the row filter.
 * @returns {JSX.Element}                                        JSX of the details section.
 */
const ResultsTable = ({
  rows,
  sort,
  filter,
  onSortChange,
  onFilterChange,
}: {
  rows: RequestResult[];
  sort: TableSort;
  filter: TableFilter;
  onSortChange: (sort: TableSort) => void;
  onFilterChange: (filter: TableFilter) => void;
}): JSX.Element => (
  <section className="mt-4 rounded-panel border border-paper/10 bg-white/5 p-4">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-sm font-semibold tracking-fine text-paper/70 uppercase">
        Per-request details
      </h2>
      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1">
          <span className="text-paper/50">Sort:</span>
          {SORTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSortChange(s)}
              className={`rounded px-2 py-0.5 ${
                sort === s
                  ? 'bg-brand text-white'
                  : 'bg-paper/10 text-paper/70 hover:bg-paper/20'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-paper/50">Filter:</span>
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onFilterChange(f)}
              className={`rounded px-2 py-0.5 ${
                filter === f
                  ? 'bg-brand text-white'
                  : 'bg-paper/10 text-paper/70 hover:bg-paper/20'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-225 text-left text-xs tabular-nums">
        <thead>
          <tr className="tracking-fine text-paper/50 uppercase">
            <Th
              align="right"
              tooltip="Original 1-based index of the request in the run. Sort or filter can reorder rows, but the # stays tied to the original probe."
            >
              #
            </Th>
            <Th tooltip="OK = the route returned success:true. FAIL = network error, abort, HTTP error, or success:false.">
              Status
            </Th>
            <Th tooltip="Qualitative latency band (matches the bar-chart legend): fast < 50 ms / ok 50–200 / medium 200–500 / slow 500–1000 / very slow > 1000 / failed.">
              Bucket
            </Th>
            <Th
              align="right"
              tooltip="Client round-trip: time measured in the browser from fetch start to JSON parse done. Includes network + server work + JSON decode."
            >
              Client
            </Th>
            <Th
              align="right"
              tooltip="Server-reported responseTime: only the time spent inside the route handler / SDK call. Network RTT is excluded."
            >
              Server
            </Th>
            <Th
              align="right"
              tooltip="Network overhead, computed as Client − Server. Approximates DNS / TCP / TLS / RTT plus browser fetch + JSON decode."
            >
              Network
            </Th>
            <Th
              align="right"
              tooltip="Approximate size of the response body in bytes (length of the JSON string, reported by the route)."
            >
              Size
            </Th>
            <Th tooltip="Wall-clock time (local) when the request was kicked off. Useful for spotting gaps and bursts in parallel mode.">
              Started
            </Th>
            <Th tooltip="Error message returned by the route or thrown by fetch (network failure, abort, HTTP error).">
              Error
            </Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <ResultsTableRow key={r.index} result={r} />
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <p className="mt-2 text-center text-xs text-paper/40">
          No rows match the current filter.
        </p>
      )}
    </div>
  </section>
);

export default ResultsTable;
