import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { MailService } from 'src/modules/mail/mail.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserActivityService } from 'src/modules/user-activity/user-activity.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly activityService: UserActivityService,
  ) { }

  /** Admin creates a user. Auto-generates password and sends email. */
  async create(dto: CreateUserDto, creatorId: string) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    // Generate a random 12-character secure password
    const temporaryPassword = crypto.randomBytes(9).toString('base64').slice(0, 12);
    const passwordHash = await bcrypt.hash(temporaryPassword, 12);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        roleId: dto.roleId,
        addedById: creatorId,
        needPasswordChange: true, // Force change on first login
      },
      include: {
        role: true,
        addedBy: true,
      },
    });

    // Send welcome email with credentials
    await this.mailService.sendWelcomeEmail(
      user.email,
      user.name,
      user.addedBy?.name || 'Administrator',
      user.role?.name || null,
      temporaryPassword,
    );

    // Don't return hashes or sensitive data
    const { passwordHash: _, resetPasswordToken: __, ...safeUser } = user;

    this.activityService.log('ACCOUNT_CREATED', 'users', creatorId, {
      id: user.id,
      name: user.name,
    });

    return safeUser;
  }

  /** Find all users with their roles and who added them. */
  async findAll() {
    const users = await this.prisma.user.findMany({
      include: {
        role: {
          select: { id: true, name: true }
        },
        addedBy: {
          select: { id: true, name: true, email: true }
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Strip sensitive fields
    return users.map(user => {
      const { passwordHash: _, resetPasswordToken: __, ...safeUser } = user;
      return safeUser;
    });
  }

  /**
   * Lightweight user summary listing for all authenticated users.
   * Useful for dropdowns, member lists, mentions, assignees, and profile cards.
   */
  async findSummary(currentUserId?: string) {
    const users = await this.prisma.user.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        profileImgUrl: true,
        lastLoginAt: true,
        createdAt: true,
        role: {
          select: { id: true, name: true },
        },
      },
    });

    return users.map((u) => ({
      userId: u.id,
      id: u.id,
      name: u.name,
      email: u.email,
      avatarUrl: u.profileImgUrl ?? null,
      profileImgUrl: u.profileImgUrl ?? null,
      role: u.role ? { id: u.role.id, name: u.role.name } : null,
      roleName: u.role?.name ?? 'Member',
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
      isCurrentUser: currentUserId ? u.id === currentUserId : false,
    }));
  }

  /** Find a single user by ID, including their role and permissions. */
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /** Update user role (Super Admin only). */
  async updateUserRole(userId: string, roleId: string, executorId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { roleId },
      include: {
        role: {
          select: { id: true, name: true, description: true },
        },
      },
    });

    if (executorId) {
      this.activityService.log('UPDATE', 'users', executorId, {
        id: userId,
        name: user.name,
        targetUserId: userId,
        newRoleId: roleId,
        newRoleName: role.name,
      });
    }

    const { passwordHash: _, resetPasswordToken: __, ...safeUser } = updatedUser;
    return safeUser;
  }
}
