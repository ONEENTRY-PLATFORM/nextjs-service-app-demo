import type { IMenusPages } from 'oneentry/dist/menus/menusInterfaces';

/**
 * Convert a flat menu structure to a nested structure based on parent-child relationships.
 *
 * This function takes a flat array of menu items and converts it into a hierarchical
 * nested structure based on the parentId property of each item. Items with a parentId
 * of null are considered root level items.
 * @param   {[] | Array<IMenusPages>} data - Array of menu pages from OneEntry CMS
 * @param   {number | null}           pid  - Parent ID to match against (null for root items)
 * @returns {IMenusPages[]}                Nested menu structure with children arrays
 * @example
 * ```typescript
 * const flatMenu = [
 *   { id: 1, parentId: null, title: 'Home' },
 *   { id: 2, parentId: null, title: 'Services' },
 *   { id: 3, parentId: 2, title: 'Haircut' },
 *   { id: 4, parentId: 2, title: 'Coloring' }
 * ];
 * const nestedMenu = flatMenuToNested(flatMenu, null);
 * // Result: [
 * //   { id: 1, parentId: null, title: 'Home', children: [] },
 * //   { id: 2, parentId: null, title: 'Services', children: [
 * //     { id: 3, parentId: 2, title: 'Haircut', children: [] },
 * //     { id: 4, parentId: 2, title: 'Coloring', children: [] }
 * //   ]}
 * // ]
 * ```
 */
export const flatMenuToNested = (
  data: [] | Array<IMenusPages>,
  pid: number | null,
): IMenusPages[] => {
  return data.reduce((r: IMenusPages[], element: IMenusPages) => {
    if (pid == element.parentId) {
      const object = { ...element };
      /**
       * The Menus API may already hand back a tree. Prefer the children it sent
       * over rebuilding them from `parentId`: reconstruction searches the FLAT
       * list, so for a tree response it finds nothing and the real submenu would
       * be deleted below. All menus arrive flat today (every `parentId` is null,
       * every `children` an empty array), which is what keeps this latent.
       */
      const apiChildren = Array.isArray(element.children)
        ? element.children
        : element.children
          ? [element.children as IMenusPages]
          : [];
      const children = apiChildren.length
        ? apiChildren
        : flatMenuToNested(data, element.id);
      if (children.length) {
        object.children = children;
      } else {
        // The API returns `children: []` on every page — drop the empty array
        // so consumers can rely on `children` meaning "has a submenu".
        delete object.children;
      }
      r.push(object);
    }
    return r;
  }, []);
};
