import { readFileSync } from 'node:fs';
import path from 'node:path';

import type { JSX } from 'react';

/**
 * Inner markup of ICONS_CATEGORY.svg — the outer `<svg>` and the white
 * background rect are stripped, everything else (circle outline + icon +
 * label) is kept intact so each tile scales as one unit. Read once at module
 * scope (server components only).
 */
const CATEGORY_INNER = readFileSync(
  path.join(process.cwd(), 'public', 'icons', 'ICONS_CATEGORY.svg'),
  'utf-8',
)
  .replace(/^[\s\S]*?<svg[^>]*>/, '')
  .replace(/<\/svg>[\s\S]*$/, '')
  .replace(/<rect\s+width="1135"[^>]*\/>/, '');

/**
 * Each tile is a 231×231 region centered on its circle in the source SVG,
 * keyed by the service category marker (child page of `services`).
 */
export const CATEGORY_TILES: Record<string, string> = {
  hair: '31.298 0 231 231',
  face: '311.766 0 231 231',
  body: '592.234 0 231 231',
  nails: '872.702 0 231 231',
};

/**
 * Resolve the tile key for a category page: by pageUrl marker first, then by
 * the localized title (e.g. title "Hair" → tile "hair").
 * @param   {string}             pageUrl - Category page marker
 * @param   {string | undefined} title   - Localized category title
 * @returns {string | undefined}         Tile key or undefined when the category has no tile
 */
export const categoryTileKey = (
  pageUrl: string,
  title?: string,
): string | undefined => {
  if (CATEGORY_TILES[pageUrl]) {
    return pageUrl;
  }
  const byTitle = title?.toLowerCase() ?? '';
  return CATEGORY_TILES[byTitle] ? byTitle : undefined;
};

/**
 * CategoryTile component — a complete category tile (outlined circle + icon
 * + label) inlined from the ICONS_CATEGORY.svg sprite.
 * @param   {object}      props        - Component properties
 * @param   {string}      props.tile   - Tile key (`hair` | `face` | `body` | `nails`)
 * @param   {string}      props.suffix - Unique suffix for SVG ids so inlined copies don't clash
 * @returns {JSX.Element}              JSX.Element representing the category tile
 */
const CategoryTile = ({
  tile,
  suffix,
}: {
  tile: string;
  suffix: string;
}): JSX.Element => {
  const viewBox = CATEGORY_TILES[tile];
  if (!viewBox) {
    return <></>;
  }

  /** Suffix ids so the inlined copies don't share clip-path ids */
  const inner = CATEGORY_INNER.replace(
    /id="([^"]+)"/g,
    `id="$1_${suffix}"`,
  ).replace(/url\(#([^)]+)\)/g, `url(#$1_${suffix})`);

  return (
    <svg
      viewBox={viewBox}
      fill="none"
      className="size-full"
      preserveAspectRatio="xMidYMid meet"
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
};

export default CategoryTile;
