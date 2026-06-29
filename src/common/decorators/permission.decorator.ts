import { SetMetadata } from '@nestjs/common';

/** Metadata key used to store required permissions on a handler or controller. */
export const PERMISSIONS_KEY = 'permissions';

/**
 * Declares the permissions required to access a route handler.
 * All listed permissions must be present in the user's JWT (AND semantics).
 *
 * @example
 * // Single permission
 * \@Permission('services.read')
 *
 * // Multiple permissions (user must have ALL of them)
 * \@Permission('services.read', 'services.update')
 *
 * // Using the perm() helper to avoid magic strings
 * \@Permission(perm('services', 'READ'))
 */
export const Permission = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
