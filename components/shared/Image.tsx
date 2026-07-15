import NextImage from 'next/image';
import type { CSSProperties, JSX, MouseEventHandler, Ref } from 'react';

/**
 * Image props.
 * @property {string}        src           - Source of the image.
 * @property {string}        [alt]         - Alt text of the image.
 * @property {boolean}       [fill]        - Whether the wrapper should fill the available space.
 * @property {number}        [width]       - Width of the wrapper.
 * @property {number}        [height]      - Height of the wrapper.
 * @property {string}        [sizes]       - Responsive `sizes` hint for next/image.
 * @property {string}        [priority]    - Priority of the image ('high' preloads it as an LCP candidate).
 * @property {string}        [className]   - Class name of the wrapper.
 * @property {CSSProperties} [style]       - Style of the wrapper.
 * @property {string}        [placeholder] - Whether to show a blur placeholder.
 * @property {string}        [blurDataURL] - Base64 LQIP used by the blur placeholder.
 * @property {string}        [loading]     - Image loading strategy ("lazy" | "eager").
 * @property {string}        [objectFit]   - Object fit of the image.
 * @property {void}          [onClick]     - Callback function when the image is clicked.
 * @property {Ref<unknown>}  ref           - Reference of the wrapping element.
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
 * Consumers size the cell through `className`/`width`/`height`, so the inner
 * image always uses `fill`. Pass `sizes` matching the grid to avoid next/image
 * defaulting to the full viewport width.
 * @param   {ImageProps}    props               - Image component props.
 * @param   {string}        props.src           - Source URL of the image.
 * @param   {string}        [props.alt]         - Alternative text for the image, defaults to empty string.
 * @param   {boolean}       [props.fill]        - Whether the wrapper fills its parent.
 * @param   {number}        [props.width]       - Width of the wrapper.
 * @param   {number}        [props.height]      - Height of the wrapper.
 * @param   {string}        [props.sizes]       - Responsive `sizes` hint for next/image.
 * @param   {string}        [props.priority]    - 'high' marks the image as an LCP candidate.
 * @param   {string}        [props.className]   - Custom CSS class name, defaults to empty string.
 * @param   {CSSProperties} [props.style]       - Custom style object, defaults to empty object.
 * @param   {string}        [props.placeholder] - Whether to show a blur placeholder.
 * @param   {string}        [props.blurDataURL] - Base64 LQIP for the blur placeholder.
 * @param   {string}        [props.loading]     - Image loading strategy ("lazy" | "eager").
 * @param   {void}          [props.onClick]     - Click handler for the image.
 * @param   {Ref<unknown>}  [props.ref]         - DOM reference of the wrapper.
 * @returns {JSX.Element}                       Returns a JSX element containing the image.
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
  onClick,
  ref,
}: ImageProps): JSX.Element => {
  /** next/image rejects `priority` together with an explicit `loading`. */
  const isPriority = priority === 'high';
  /** A blur placeholder is only valid when there is an LQIP to show. */
  const hasBlur = placeholder === 'blur' && !!blurDataURL;
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
      <NextImage
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? '100vw'}
        className="object-cover"
        onClick={onClick}
        {...(isPriority ? { priority: true } : loading ? { loading } : {})}
        {...(hasBlur ? { placeholder: 'blur' as const, blurDataURL } : {})}
      />
    </div>
  );
};

export default Image;
