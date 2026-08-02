'use client';

import type { JSX } from 'react';

/**
 * ContactFieldsSkeleton component — the placeholder stack of the "Write to us"
 * card, shown while the `contact_us` CMS form definition is still loading.
 *
 * Carries no copy on purpose: the card renders strictly from the CMS, so the
 * skeleton only holds the layout (two short fields, one full-width field, one
 * textarea) to keep the section from shifting once the fields arrive.
 * @returns {JSX.Element} Pulsing placeholders in the shape of the form
 */
const ContactFieldsSkeleton = (): JSX.Element => (
  <div className="space-y-5" aria-hidden="true">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="h-18.5 animate-pulse rounded-2xl bg-slate-150" />
      <div className="h-18.5 animate-pulse rounded-2xl bg-slate-150" />
    </div>
    <div className="h-18.5 animate-pulse rounded-2xl bg-slate-150" />
    <div className="h-35.5 animate-pulse rounded-2xl bg-slate-150" />
  </div>
);

export default ContactFieldsSkeleton;
