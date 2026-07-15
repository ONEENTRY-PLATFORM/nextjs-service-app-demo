'use client';

import Image from 'next/image';
import type { JSX } from 'react';
import { useState } from 'react';

import PortfolioLightbox from './PortfolioLightbox';

/** A single portfolio image with its full/thumbnail/preview sources. */
type PortfolioImage = {
  img: string;
  thumb: string;
  preview: string;
  alt: string;
};

/**
 * PortfolioGallery component — the responsive portfolio grid with a lightbox.
 *
 * Renders every portfolio image as an `aspect-4/5` rounded cell that zooms
 * slightly on hover; clicking a cell opens the custom {@link PortfolioLightbox}
 * seeded with that image's index.
 * @param   {object}           props            - Component properties.
 * @param   {PortfolioImage[]} props.images     - Portfolio images to display.
 * @param   {string}           props.masterName - Master name (lightbox caption).
 * @param   {string}           props.role       - Master role line (lightbox caption).
 * @returns {JSX.Element}                       JSX.Element representing the portfolio gallery.
 */
const PortfolioGallery = ({
  images,
  masterName,
  role,
}: {
  images: PortfolioImage[];
  masterName: string;
  role: string;
}): JSX.Element => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 px-3 pb-4 sm:grid-cols-3 md:gap-4 md:px-6 lg:grid-cols-5">
        {images.map((item, index) => (
          <button
            key={index}
            onClick={() => setOpenIndex(index)}
            aria-label={`Open portfolio image ${index + 1}`}
            className="group relative aspect-4/5 cursor-pointer overflow-hidden rounded-2xl"
          >
            {/* Grid cells use the thumbnail; the full-size `img` is the lightbox's. */}
            <Image
              src={item.thumb || item.img}
              alt={item.alt}
              fill
              sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              {...(item.preview
                ? { placeholder: 'blur' as const, blurDataURL: item.preview }
                : {})}
            />
          </button>
        ))}
      </div>

      {openIndex !== null ? (
        <PortfolioLightbox
          images={images}
          index={openIndex}
          masterName={masterName}
          role={role}
          onClose={() => setOpenIndex(null)}
          onSelect={(i) => setOpenIndex(i)}
        />
      ) : null}
    </>
  );
};

export default PortfolioGallery;
