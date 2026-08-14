/**
 * Central registry for all application modules and permission actions.
 *
 * Usage:
 *   import { perm } from 'src/common/constants/permissions.constant';
 *   @Permission(perm('services', 'READ'))
 *
 * New modules/actions can be added here without any other architectural changes.
 */

export const APP_MODULES = [
  'dashboard',
  'leads',
  'services',
  'case_studies',
  'travel_insights',
  'guides',
  'video_sessions',
  'team_members',
  'media',
  'analytics',
  'team_management',
  'settings',
  'expenses',
  'user_activity',
] as const;

export type AppModule = (typeof APP_MODULES)[number];

export const PERMISSION_ACTIONS = ['READ', 'CREATE', 'UPDATE', 'DELETE'] as const;

export type PermissionActionType = (typeof PERMISSION_ACTIONS)[number];

/**
 * Builds a typed permission string in the format `module.action_lowercase`.
 *
 * @example perm('services', 'READ') => 'services.read'
 */
export const perm = (module: string, action: string): string =>
  `${module}.${action.toLowerCase()}`;

/** The name of the protected Super Admin role. Centralised to avoid typos. */
export const SUPER_ADMIN_ROLE = 'Super Admin';
