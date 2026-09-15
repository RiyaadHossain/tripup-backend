import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { SuperAdminGuard } from 'src/common/guards/super-admin.guard';
import { Permission } from 'src/common/decorators/permission.decorator';
import { perm } from 'src/common/constants/permissions.constant';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * POST /users
   * Admin creates a new user. Password is auto-generated and emailed.
   */
  @Post()
  @Permission(perm('team_management', 'CREATE'))
  create(@Body() dto: CreateUserDto, @Request() req: { user: JwtPayload }) {
    return this.usersService.create(dto, req.user.sub);
  }

  /**
   * GET /users
   * Returns all users with their roles and who created them.
   */
  @Get()
  @Permission(perm('team_management', 'READ'))
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * PATCH /users/:id/role
   * Update a user's role. Super Admin only.
   */
  @Patch(':id/role')
  @UseGuards(SuperAdminGuard)
  updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @Request() req: { user: JwtPayload },
  ) {
    return this.usersService.updateUserRole(id, dto.roleId, req.user.sub);
  }
}


