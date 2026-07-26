[Back to README](../README.md)

# UI Text Dictionary in OneEntry Next.js Beauty Salon

This document describes how the app's UI copy (button labels, headings, empty
states, aria-labels, form messages, …) is stored in OneEntry and rendered in the
app. It is a single-locale (`en_US`) dictionary of short UI strings — not a
full i18n framework.

## Overview

Every user-facing string is read from the OneEntry CMS with an **English
fallback baked into the code**, so the UI never breaks when the CMS is
unavailable or a value is empty:

```tsx
dictText(dict, 'book_text', 'Book Online');
```

The canonical way to read a value is the **`dictText` utility**
(`components/utils/dictText.ts`): it returns the CMS value only when it really
is a non-empty string, and the fallback otherwise. The older inline pattern
`(dict?.marker?.value as string | undefined) || 'Fallback'` is unreliable — an
unfilled marker comes back from the CMS as an **empty array**, which is truthy,
so the cast lets a non-string value travel on as a fake string instead of
falling back.

The values live in the **`system_content` attribute set**, one attribute per
marker (e.g. `book_text`, `continue_text`, `booking_success_title`). The value a
content editor fills is the attribute's **default value (`initialValue`)**.

## Where the values are stored & edited

- **CMS location:** admin panel → **Settings → Attributes → “System content”**.
  Each attribute's value field is its `initialValue`
  (`set.schema.attribute{N}.initialValue.en_US.value`).
- Editing a value there is reflected on the site within ~60s (the read cache
  TTL). An empty value falls back to the English literal in the code.
- The full marker → value inventory lives in
  [`ONEENTRY-CONTENT-PLAN.md`](../ONEENTRY-CONTENT-PLAN.md) («Словарь UI-текстов»).

> ⚠️ The `system_content` **block** (a separate CMS entity) is **not** used for
> the dictionary. The site reads the attribute **set's** `initialValue`, and a
> block read does not fall back to it — the two are independent.

## How it is read — `getDictionary()`

`app/api/utils/dictionaries.ts` reads the set publicly and maps each attribute
to the `{ marker: { value } }` shape every consumer expects:

```ts
const attrs = await getApi().AttributesSets.getAttributesByMarker('system_content');
// → [{ marker, initialValue, position, type, ... }]  (initialValue delocalized to langCode)
return Object.fromEntries(
  attrs.filter((a) => a.marker).map((a) => [a.marker, { value: a.initialValue ?? undefined }]),
) as IAttributeValues;
```

The read is wrapped in a cross-request TTL cache (`createCachedCmsReader`,
`revalidate: 60`) and React `cache()` for per-request dedupe. It never throws:
a transient failure or missing set degrades to an empty dictionary.

## How components consume it

The dictionary reaches components through two mechanisms — pick by component
type:

| Component type | How to read the dictionary |
| --- | --- |
| **Server component** | `const [dict] = ServerProvider<IAttributeValues>('dict');` (the page sets it once via `ServerProvider('dict', await getDictionary())`) |
| **Client component** | `const dict = useDict();` — `DictProvider` is mounted once in `app/layout.tsx`, so any client component below it can read without prop-drilling |

Both then read values the same way: `dictText(dict, '<marker>', 'Fallback')`.

Relevant files:

- `components/utils/dictText.ts` — the `dictText()` read utility.
- `app/store/providers/DictContext.tsx` — the client React context.
- `app/store/providers/DictProvider.tsx` — provider, mounted in `app/layout.tsx`.
- `app/store/providers/useDict.ts` — the `useDict()` hook.
- `app/store/providers/ServerProvider.tsx` — request-scoped server store (`'dict'` key).

## Templated strings — use `%token%`, never `{…}`

Some values interpolate a runtime value (a count, a query, a duration). The
placeholder uses **percent-delimited tokens**, resolved in code with `.replace`:

```tsx
// CMS value: "Step %x% of %y%"
dictText(dict, 'booking_step_of_text', 'Step %x% of %y%')
  .replace('%x%', String(currentIdx + 1))
  .replace('%y%', String(totalSteps));
```

> ⚠️ **Do not use `{…}` (curly braces) in a value.** OneEntry casts attribute
> values to JSON (PostgreSQL); a value containing `{` / `}` makes the public API
> return `500 invalid input syntax for type json` and the **entire** dictionary
> read comes back empty. (Admin-GET / Postman still return the raw value, so it
> "looks fine" in the admin while the site is empty.) Attribute _labels_ tolerate
> braces — only _values_ break.

## Adding or changing a marker

1. **Add the attribute** to the `system_content` set (admin, or the fill script
   `.claude/temp/fill-system-content.mjs`) with a `string` type and a sensible
   value (no `{}` — use `%token%` for placeholders).
2. **Reference it in code** with an English fallback:
   `dictText(dict, 'my_marker', 'My text')`.
3. New markers render the fallback until a value is set in the CMS — nothing to
   deploy on the CMS side is required for the code to ship.

## Graceful degradation

Because every call site carries an English fallback, the app renders correctly
in every state: CMS down, set missing, individual value empty, or a transient
read failure. The dictionary is an enhancement (CMS-editable copy), never a hard
dependency.
