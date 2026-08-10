import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permission.decorator';
import { SUPER_ADMIN_ROLE } from '../constants/permissions.constant';
import { JwtPayload } from 'src/modules/auth/interfaces/jwt-payload.interface';

/**
 * Permission-Based Access Control (PBAC) guard.
 *
 * Works in conjunction with JwtAuthGuard (which must run first and populate
 * request.user from the JWT) and the @Permission() decorator.
 *
 * Algorithm:
 *  1. If no @Permission() metadata → route is publicly accessible, allow.
 *  2. Resolve authenticated user from request.user (set by JwtStrategy).
 *  3. Super Admin role → always allow (bypass).
 *  4. Check that ALL required permissions are present in the user's JWT
 *     permissions array. Deny with 403 if any are missing.
 *
 * @example
 * // Apply both guards together at class or method level
 * \@UseGuards(JwtAuthGuard, PermissionGuard)
 * \@Permission('services.read')
 * \@Get()
 * findAll() {}
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Merge metadata from handler and class (handler takes precedence)
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No permissions metadata → allow (no restriction on this route)
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: JwtPayload }>();
    const user = request.user;

    // Super Admin bypasses all permission checks unconditionally
    if (user?.role === SUPER_ADMIN_ROLE) {
      return true;
    }

    const userPermissions: string[] = user?.permissions ?? [];

    // All required permissions must be present (AND semantics)
    const hasAll = requiredPermissions.every((required) =>
      userPermissions.includes(required),
    );

    console.log('hasAll', hasAll);
    console.log('requiredPermissions', requiredPermissions);
    console.log('userPermissions', userPermissions);

    if (!hasAll) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }

    return true;
  }
}
