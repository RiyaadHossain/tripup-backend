import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Permission } from 'src/common/decorators/permission.decorator';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { perm } from 'src/common/constants/permissions.constant';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';

/**
 * Role management endpoints.
 * All routes require a valid JWT and the appropriate team_management permission.
 *
 * Base path: /roles
 */
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * POST /roles
   * Create a new role and optionally attach permissions.
   */
  @Post()
  @Permission(perm('team_management', 'CREATE'))
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  /**
   * GET /roles
   * List all roles with their assigned permissions.
   */
  @Get()
  @Permission(perm('team_management', 'READ'))
  findAll() {
    return this.rolesService.findAll();
  }

  /**
   * GET /roles/:id
   * Retrieve a single role with its permissions.
   */
  @Get(':id')
  @Permission(perm('team_management', 'READ'))
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  /**
   * PATCH /roles/:id
   * Update role name/description.
   * If permissionIds is provided, it REPLACES the current permission set atomically.
   */
  @Patch(':id')
  @Permission(perm('team_management', 'UPDATE'))
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  /**
   * DELETE /roles/:id
   * Delete a role. The "Super Admin" role cannot be deleted.
   */
  @Delete(':id')
  @Permission(perm('team_management', 'DELETE'))
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
