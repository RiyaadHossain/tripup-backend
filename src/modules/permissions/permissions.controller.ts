import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Permission } from 'src/common/decorators/permission.decorator';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { perm } from 'src/common/constants/permissions.constant';
import { PermissionsService } from './permissions.service';

/**
 * Read-only permission listing endpoints.
 * Consumed by the frontend permission matrix when building the role editor UI.
 *
 * Base path: /permissions
 */
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  /**
   * GET /permissions
   * Returns permissions grouped by module.
   *
   * Query: ?flat=true — returns a flat list instead (useful for dropdowns).
   *
   * Default grouped response:
   * [{ module: "services", permissions: [{ id, action }] }]
   */
  @Get()
  @Permission(perm('team_management', 'READ'))
  findAll(@Query('flat') flat?: string) {
    if (flat === 'true') {
      return this.permissionsService.findAll();
    }
    return this.permissionsService.findAllGrouped();
  }
}
