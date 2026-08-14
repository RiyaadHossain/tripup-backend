import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { SUPER_ADMIN_ROLE } from 'src/common/constants/permissions.constant';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UserActivityService } from 'src/modules/user-activity/user-activity.service';

/** Prisma include shape reused for every role query that needs permissions. */
const ROLE_WITH_PERMISSIONS = {
  permissions: {
    include: { permission: true },
  },
} as const;

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: UserActivityService,
  ) {}

  // ---------------------------------------------------------------------------
  // Create
  // ---------------------------------------------------------------------------

  async create(dto: CreateRoleDto, userId: string) {
    const existing = await this.prisma.role.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException(`Role "${dto.name}" already exists`);
    }

    const role = await this.prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description,
        addedBy: userId ? { connect: { id: userId } } : undefined,
        permissions: dto.permissionIds?.length
          ? {
              create: dto.permissionIds.map((permissionId) => ({
                permission: { connect: { id: permissionId } },
              })),
            }
          : undefined,
      },
      include: ROLE_WITH_PERMISSIONS,
    });

    this.activityService.log('CREATE', 'roles', userId, {
      id: role.id,
      name: role.name,
    });

    return role;
  }

  // ---------------------------------------------------------------------------
  // Read
  // ---------------------------------------------------------------------------

  async findAll() {
    return this.prisma.role.findMany({
      include: ROLE_WITH_PERMISSIONS,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: ROLE_WITH_PERMISSIONS,
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  // ---------------------------------------------------------------------------
  // Update
  // ---------------------------------------------------------------------------

  /**
   * Updates name/description and, when permissionIds is provided, atomically
   * replaces all permission assignments using a Prisma transaction.
   */
  async update(id: string, dto: UpdateRoleDto, userId?: string) {
    const existing = await this.prisma.role.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Role not found');
    }

    // Prevent renaming the Super Admin role
    if (
      existing.name === SUPER_ADMIN_ROLE &&
      dto.name &&
      dto.name !== SUPER_ADMIN_ROLE
    ) {
      throw new BadRequestException(
        `The "${SUPER_ADMIN_ROLE}" role name cannot be changed`,
      );
    }

    // If permissionIds is explicitly provided, replace all permissions atomically
    if (dto.permissionIds !== undefined) {
      return this.prisma.$transaction(async (tx) => {
        // Delete existing permission links
        await tx.rolePermission.deleteMany({ where: { roleId: id } });

        // Re-create with the new set
        const updated = await tx.role.update({
          where: { id },
          data: {
            name: dto.name,
            description: dto.description,
            permissions: dto.permissionIds!.length
              ? {
                  create: dto.permissionIds!.map((permissionId) => ({
                    permission: { connect: { id: permissionId } },
                  })),
                }
              : undefined,
          },
          include: ROLE_WITH_PERMISSIONS,
        });

        this.activityService.log('UPDATE', 'roles', userId, {
          id: updated.id,
          name: updated.name,
        });

        return updated;
      });
    }

    // No permissionIds provided — update only the scalar fields
    const updated = await this.prisma.role.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
      },
      include: ROLE_WITH_PERMISSIONS,
    });

    this.activityService.log('UPDATE', 'roles', userId, {
      id: updated.id,
      name: updated.name,
    });

    return updated;
  }

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  async remove(id: string, userId?: string) {
    const role = await this.prisma.role.findUnique({ where: { id } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.name === SUPER_ADMIN_ROLE) {
      throw new BadRequestException(
        `The "${SUPER_ADMIN_ROLE}" role cannot be deleted`,
      );
    }

    this.activityService.log('DELETE', 'roles', userId, {
      id: role.id,
      name: role.name,
    });

    return this.prisma.role.delete({ where: { id } });
  }
}
