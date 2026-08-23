import type { IAdminEntity } from 'oneentry/types';

/**
 * Extract a string attribute value from an admin entity.
 * @param   {IAdminEntity} admin  - Admin (master) entity
 * @param   {string}       marker - Attribute marker
 * @returns {string}              Attribute value or empty string
 */
export const adminAttr = (admin: IAdminEntity, marker: string): string =>
  (admin.attributeValues?.[marker]?.value as string | undefined) ?? '';
