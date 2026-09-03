/**
 * formatReviewDate — render a review's date the way the cards show it: `12 May 2026`.
 *
 * Reviews carry an ISO date (`review_date`, or the record's own timestamp), and
 * the design prints a short English date. Anything unparseable is passed through
 * untouched rather than replaced with a placeholder — a hand-entered date in the
 * admin panel should still reach the card as typed.
 * @param   {string} isoDate - ISO date string, e.g. `2026-05-12`
 * @returns {string}         Display date, e.g. `12 May 2026`
 */
export const formatReviewDate = (isoDate: string): string => {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;

  return parsed.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};
