import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { perm } from 'src/common/constants/permissions.constant';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // ---------------------------------------------------------------------------
  // Register
  // ---------------------------------------------------------------------------

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
      },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    return user;
  }

  // ---------------------------------------------------------------------------
  // Login
  // ---------------------------------------------------------------------------

  async login(dto: LoginDto) {
    // Load user with full role + permission chain
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Build the flat permission string list that gets embedded in the JWT.
    // Format: module.action_lowercase  (e.g. "services.read")
    const permissions: string[] = user.role
      ? user.role.permissions.map(({ permission }) =>
          perm(permission.module, permission.action),
        )
      : [];

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role?.name ?? null,
      permissions,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role?.name ?? null,
        permissions,
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Frontend helper — returns permissions in a format the UI can consume
  // ---------------------------------------------------------------------------

  /**
   * Returns the current user's role and flat permission list.
   * The frontend can use this to drive `can('services.read')` checks for
   * showing/hiding menus, buttons, and pages.
   */
  getMyPermissions(user: JwtPayload) {
    return {
      role: user.role,
      permissions: user.permissions,
    };
  }
}
