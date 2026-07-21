import { getDictionary } from '@/app/api/utils/dictionaries';

/** Site name fallback when the `system_content` dictionary is unavailable. */
const SITE_NAME_FALLBACK = 'Thalia Beauty Studio';

/**
 * Public site name for metadata and structured data.
 *
 * Reads the `site_name` UI-text of the `system_content` block and falls back to
 * the hardcoded brand name. `getDictionary()` is cached (per render and across
 * requests), so calling this from every `generateMetadata` costs nothing.
 * @returns {Promise<string>} Site name, never empty
 */
export const getSiteName = async (): Promise<string> => {
  const dict = await getDictionary();
  return (dict?.site_name?.value as string | undefined) || SITE_NAME_FALLBACK;
};
