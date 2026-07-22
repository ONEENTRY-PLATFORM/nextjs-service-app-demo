import type { OneEntryImageFile } from './OneEntryImageFile';

/**
 * imageFileList — read a `groupOfImages` attribute (e.g. `gallery_photos`) as a
 * list of files.
 *
 * An unset multi-value attribute does not come back as `[]`: OneEntry sends the
 * empty **string**, which `?? []` lets straight through — it is neither `null`
 * nor `undefined`. The three call sites that cast `gallery_photos.value` to an
 * array and appended `?? []` were therefore one empty attribute away from
 * `''.map is not a function` (the portfolio grid) or from silently iterating a
 * string character by character (the gallery reader). This is the same hazard
 * `entityLinks` closes for entity links, and `fileDisplayUrl` for single files.
 * @param   {unknown}             value - Raw `attributeValues.<marker>.value`
 * @returns {OneEntryImageFile[]}       The files, or `[]` for anything unusable
 */
export const imageFileList = (value: unknown): OneEntryImageFile[] =>
  Array.isArray(value) ? (value as OneEntryImageFile[]) : [];
