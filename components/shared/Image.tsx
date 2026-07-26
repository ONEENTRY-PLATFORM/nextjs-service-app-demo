'use client';

import NextImage from 'next/image';
import type { CSSProperties, JSX, MouseEventHandler, Ref } from 'react';
import { useState } from 'react';

import ImagePlaceholder from './ImagePlaceholder';

/**
 * Image props.
 * @property {string}        src              - Source of the image; `''` renders the brand placeholder.
 * @property {string}        [alt]            - Alt text of the image.
 * @property {boolean}       [fill]           - Whether the wrapper should fill the available space.
 * @property {number}        [width]          - Width of the wrapper.
 * @property {number}        [height]         - Height of the wrapper.
 * @property {string}        [sizes]          - Responsive `sizes` hint for next/image.
 * @property {string}        [priority]       - Priority of the image ('high' preloads it as an LCP candidate).
 * @property {string}        [className]      - Class name of the wrapper.
 * @property {CSSProperties} [style]          - Style of the wrapper.
 * @property {string}        [placeholder]    - Whether to show a blur placeholder.
 * @property {string}        [blurDataURL]    - Base64 LQIP used by the blur placeholder.
 * @property {string}        [loading]        - Image loading strategy ("lazy" | "eager").
 * @property {string}        [imageClassName] - Extra classes of the inner `<img>` (object-position, hover transforms).
 * @property {string}        [objectFit]      - Object fit of the image.
 * @property {void}          [onClick]        - Callback function when the image is clicked.
 * @property {Ref<unknown>}  ref              - Reference of the wrapping element.
 */
export type ImageProps = {
  src: string;
  alt?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: 'auto' | 'low' | 'high';
  className?: string;
  style?: CSSProperties;
  placeholder?: 'blur' | 'empty' | `data:image/${string}`;
  blurDataURL?: string;
  loading?: 'eager' | 'lazy' | undefined;
  imageClassName?: string;
  objectFit?: string;
  ref?: Ref<HTMLDivElement>;
  onClick?: MouseEventHandler<HTMLImageElement>;
};

/**
 * Custom Image component for rendering CMS images.
 *
 * Keeps the wrapper contract (a positioned `div` that carries the layout
 * classes and the forwarded `ref`) while delegating the actual image to
 * `next/image`, so CMS photos get AVIF/WebP conversion, responsive `srcset`
 * and the native blur placeholder instead of a hand-rolled LQIP layer.
 *
 * An empty `src` and a source that fails to load (e.g. a CMS file deleted from
 * the CDN) both render {@link ImagePlaceholder} — the centered brand logo —
 * instead of the browser's broken-image icon. The failure is caught twice: by
 * `onError` for post-hydration failures, and by a ref check + cache probe for
 * images that already errored before React attached the handler.
 *
 * Consumers size the cell through `className`/`width`/`height`, so the inner
 * image always uses `fill`. Pass `sizes` matching the grid to avoid next/image
 * defaulting to the full viewport width. Classes that must land on the `<img>`
 * itself (`object-top`, hover `scale-*` transitions) go into `imageClassName`.
 * @param   {ImageProps}    props                  - Image component props.
 * @param   {string}        props.src              - Source URL of the image; `''` renders the placeholder.
 * @param   {string}        [props.alt]            - Alternative text for the image, defaults to empty string.
 * @param   {boolean}       [props.fill]           - Whether the wrapper fills its parent.
 * @param   {number}        [props.width]          - Width of the wrapper.
 * @param   {number}        [props.height]         - Height of the wrapper.
 * @param   {string}        [props.sizes]          - Responsive `sizes` hint for next/image.
 * @param   {string}        [props.priority]       - 'high' marks the image as an LCP candidate.
 * @param   {string}        [props.className]      - Custom CSS class name, defaults to empty string.
 * @param   {CSSProperties} [props.style]          - Custom style object, defaults to empty object.
 * @param   {string}        [props.placeholder]    - Whether to show a blur placeholder.
 * @param   {string}        [props.blurDataURL]    - Base64 LQIP for the blur placeholder.
 * @param   {string}        [props.loading]        - Image loading strategy ("lazy" | "eager").
 * @param   {string}        [props.imageClassName] - Extra classes appended to the inner `<img>`.
 * @param   {void}          [props.onClick]        - Click handler for the image.
 * @param   {Ref<unknown>}  [props.ref]            - DOM reference of the wrapper.
 * @returns {JSX.Element}                          Returns a JSX element containing the image.
 */
const Image = ({
  src,
  alt = '',
  fill,
  width,
  height,
  sizes,
  priority,
  className = '',
  style = {},
  placeholder,
  blurDataURL,
  loading,
  imageClassName = '',
  onClick,
  ref,
}: ImageProps): JSX.Element => {
  /**
   * The source that failed to load, if any. Storing the URL rather than a
   * boolean resets the fallback for free when `src` changes — a boolean would
   * keep showing the placeholder after the consumer swaps in a valid photo.
   */
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  /** next/image rejects `priority` together with an explicit `loading`. */
  const isPriority = priority === 'high';
  /** A blur placeholder is only valid when there is an LQIP to show. */
  const hasBlur = placeholder === 'blur' && !!blurDataURL;
  /** No source or a broken one — paint the brand placeholder instead. */
  const showPlaceholder = !src || failedSrc === src;
  /**
   * The inner image uses `fill`, so the wrapper must be a positioned box with a
   * real height. Callers often position it themselves (e.g. `absolute inset-0`
   * to stretch over a sized cell); adding `relative` unconditionally would win
   * the cascade over their `absolute` and collapse the wrapper to zero height.
   */
  const isPositioned = /(?:^|\s)(?:absolute|fixed|sticky)(?:\s|$)/.test(
    className,
  );

  return (
    <div
      className={`${isPositioned ? '' : 'relative'} overflow-hidden ${fill ? 'size-full' : ''} ${className}`}
      style={{ width, height, ...style }}
      ref={ref}
    >
      {showPlaceholder ? (
        <ImagePlaceholder />
      ) : (
        <NextImage
          src={src}
          alt={alt}
          fill
          sizes={sizes ?? '100vw'}
          className={`object-cover ${imageClassName}`}
          onClick={onClick}
          onError={() => setFailedSrc(src)}
          // An image that 404s before hydration never fires `onError`, so the
          // ref inspects the settled state. `naturalWidth === 0` alone is not
          // proof of a failure: a hidden responsive variant (`sizes` computing
          // to 1px, as in the hero) loads fine yet reports 0 after density
          // correction. A probe `Image` without srcset/sizes re-requests the
          // same URL (from cache) and errors only on a genuinely broken file.
          ref={(img) => {
            if (!img?.complete || img.naturalWidth > 0) {
              return;
            }
            const url = img.currentSrc || img.src;
            if (!url) {
              return;
            }
            const probe = new window.Image();
            probe.onerror = () => setFailedSrc(src);
            probe.src = url;
          }}
          {...(isPriority ? { priority: true } : loading ? { loading } : {})}
          {...(hasBlur ? { placeholder: 'blur' as const, blurDataURL } : {})}
        />
      )}
    </div>
  );
};

export default Image;
