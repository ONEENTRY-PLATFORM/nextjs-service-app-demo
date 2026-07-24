import type { JSX } from 'react';

import { serializeJsonLd } from '@/components/shared/serializeJsonLd';

/**
 * JsonLd — inline a structured-data object as a `<script type="application/ld+json">`.
 *
 * Five routes repeated the same `<script … dangerouslySetInnerHTML={{ __html:
 * serializeJsonLd(x) }} />`. That is exactly the kind of duplication worth
 * removing: the escaping is a security measure (see {@link serializeJsonLd}),
 * and a sixth call site written by hand could forget it and reintroduce the
 * tag break-out.
 *
 * Renders nothing for `null` / `undefined`, so callers can pass the result of a
 * builder that yields no data when the CMS is unavailable — instead of guarding
 * at every call site and shipping an empty `{}` when the guard is a truthiness
 * check.
 * @param   {object}             props      - Component props
 * @param   {object | null}      props.data - Structured-data object, or nothing to render
 * @returns {JSX.Element | null}            The script tag, or nothing
 */
const JsonLd = ({
  data,
}: {
  data: object | null | undefined;
}): JSX.Element | null =>
  data ? (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  ) : null;

export default JsonLd;
