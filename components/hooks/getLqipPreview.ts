import lqipModern from 'lqip-modern';
import { unstable_cache } from 'next/cache';

/** Fetch timeout for the source image (ms). CDN cold starts can exceed a few seconds. */
const FETCH_TIMEOUT_MS = 15_000;

/** Revalidate cached LQIPs once per month — image URLs on OneEntry CDN are content-addressed. */
const REVALIDATE_SECONDS = 60 * 60 * 24 * 30;

/**
 * Fetch the source image and generate a base64 LQIP data URI.
 * Isolated from the cached wrapper so the cache layer can key on the URL directly.
 * @param   {string}                 imageUrl - The URL of the image to process
 * @returns {Promise<string | null>}          base64 data URI or null on error
 */
const generateLqip = async (imageUrl: string): Promise<string | null> => {
  try {
    const response = await fetch(imageUrl, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
    const previewImage = await lqipModern(imageBuffer);

    return previewImage.metadata.dataURIBase64;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error generating LQIP preview:', error);
    return null;
  }
};

/**
 * Cached LQIP generator. Next.js `unstable_cache` derives the cache key from the
 * key-parts array plus the function arguments, so each unique `imageUrl` is only
 * fetched + processed once per revalidation window.
 */
const cachedLqip = unstable_cache(
  (imageUrl: string) => generateLqip(imageUrl),
  ['lqip-preview'],
  { revalidate: REVALIDATE_SECONDS, tags: ['lqip'] },
);

/**
 * Generate a Low Quality Image Placeholder (LQIP) preview for an image.
 *
 * Wraps the actual fetch + sharp processing in `unstable_cache`, so the same
 * `imageUrl` is only processed once per revalidation window across SSR renders.
 * @param   {string}                 imageUrl - The URL of the image to generate a preview for
 * @returns {Promise<string | null>}          A Promise that resolves to a base64-encoded preview or null
 */
const getLqipPreview = async (imageUrl: string): Promise<string | null> => {
  if (!imageUrl) {
    return null;
  }
  return cachedLqip(imageUrl);
};

export default getLqipPreview;
