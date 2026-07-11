/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, JSX, MouseEventHandler, Ref } from 'react';

/**
 * Image props.
 * @property {string}        src         - Source of the image.
 * @property {string}        [alt]       - Alt text of the image.
 * @property {boolean}       [fill]      - Whether the image should fill the available space.
 * @property {number}        [width]     - Width of the image.
 * @property {number}        [height]    - Height of the image.
 * @property {string}        [className] - Class name of the image.
 * @property {CSSProperties} [style]     - Style of the image.
 * @property {string}        [objectFit] - Object fit of the image.
 * @property {string}        [priority]  - Priority of the image.
 * @property {void}          [onClick]   - Callback function when the image is clicked.
 * @property {Ref<unknown>}  ref         - Reference of the wrapping element.
 */
export type ImageProps = {
  src: string;
  alt?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: 'auto' | 'low' | 'high';
  className?: string;
  style?: CSSProperties;
  placeholder?: 'blur' | 'empty' | `data:image/${string}`;
  blurDataURL?: string;
  loading?: 'eager' | 'lazy' | undefined;
  objectFit?: string;
  ref?: Ref<HTMLDivElement>;
  onClick?: MouseEventHandler<HTMLImageElement>;
  // decoding?: 'async' | 'sync' | 'auto';
};
/**
 * Custom Image component for rendering images
 * @param   {ImageProps}    props               - Image component props.
 * @param   {string}        props.src           - Source URL of the image.
 * @param   {string}        [props.alt]         - Alternative text for the image, defaults to empty string.
 * @param   {boolean}       [props.fill]        - Whether to fill the parent container.
 * @param   {number}        [props.width]       - Width of the image.
 * @param   {number}        [props.height]      - Height of the image.
 * @param   {string}        [props.priority]    - Whether to prioritize loading, fetchPriority priority.
 * @param   {string}        [props.className]   - Custom CSS class name, defaults to empty string.
 * @param   {CSSProperties} [props.style]       - Custom style object, defaults to empty object.
 * @param   {string}        [props.placeholder] - Whether to show placeholder image.
 * @param   {string}        [props.blurDataURL] - URL of the blurred placeholder image.
 * @param   {string}        [props.loading]     - Image loading strategy ("lazy" | "eager").
 * @param   {boolean}       [props.objectFit]   - Image object-fit property.
 * @param   {void}          [props.onClick]     - Click handler for the image
 * @param   {Ref<unknown>}  [props.ref]         - DOM reference.
 * @returns {JSX.Element}                       Returns a JSX element containing the image.
 */
const Image = ({
  src,
  alt = '',
  fill,
  width,
  height,
  priority,
  className = '',
  style = {},
  placeholder,
  blurDataURL,
  loading,
  // objectFit,
  onClick,
  ref,
}: ImageProps): JSX.Element => {
  return (
    <div
      className={`relative overflow-hidden ${fill ? 'size-full' : ''} ${className}`}
      style={{ width, height, ...style }}
      ref={ref}
    >
      {placeholder && blurDataURL && (
        <img
          src={blurDataURL}
          alt={alt}
          fetchPriority="high"
          aria-hidden="true"
          className={
            'absolute inset-0 z-0 size-full scale-110 object-cover blur-xl transition-opacity duration-300 '
          }
        />
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={
          'relative z-10 size-full object-cover transition-opacity duration-300 '
        }
        onClick={onClick}
        onLoad={(e) => {
          if (placeholder) {
            e.currentTarget.previousElementSibling?.classList.add('opacity-0');
          }
        }}
        fetchPriority={priority || 'auto'}
      />
    </div>
  );
};

export default Image;
