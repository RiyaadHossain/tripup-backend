import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SUPER_ADMIN_ROLE } from 'src/common/constants/permissions.constant';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class CompetitionPermissionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      return false;
    }

    // Super Admin unconditionally bypasses
    if (user.role === SUPER_ADMIN_ROLE) {
      return true;
    }

    const permissions: string[] = user.permissions || [];
    const hasPerm = (action: string) => {
      const act = action.toLowerCase();
      return (
        permissions.includes(`competition.${act}`) ||
        (act === 'view' && permissions.includes('competition.read')) ||
        (act === 'read' && permissions.includes('competition.view'))
      );
    };

    const method = request.method.toUpperCase();

    // 1. GET requests require view/read permission
    if (method === 'GET') {
      if (!hasPerm('view') && !hasPerm('read')) {
        throw new ForbiddenException(
          'You do not have permission to perform this action',
        );
      }
      return true;
    }

    // 2. POST requests require create permission
    if (method === 'POST') {
      if (!hasPerm('create')) {
        throw new ForbiddenException(
          'You do not have permission to perform this action',
        );
      }
      return true;
    }

    // 3. DELETE requests require delete permission
    if (method === 'DELETE') {
      if (!hasPerm('delete')) {
        throw new ForbiddenException(
          'You do not have permission to perform this action',
        );
      }
      return true;
    }

    // 4. PUT requests require update permission
    if (method === 'PUT') {
      if (!hasPerm('update')) {
        throw new ForbiddenException(
          'You do not have permission to perform this action',
        );
      }
      return true;
    }

    // 5. PATCH requests
    if (method === 'PATCH') {
      if (hasPerm('update')) {
        return true;
      }

      const path: string = request.route?.path || request.url;
      const isTeamPatch =
        path.includes('/teams/:id') ||
        (request.url.includes('/teams/') && !request.url.includes('/archive'));

      // Check Team Leader rule: user with only view permission who is leaderId of that team
      if (isTeamPatch && (hasPerm('view') || hasPerm('read'))) {
        const teamId = request.params?.id;
        if (!teamId) {
          throw new ForbiddenException(
            'You do not have permission to perform this action',
          );
        }

        const team = await this.prisma.competitionTeam.findUnique({
          where: { id: teamId },
        });

        if (!team) {
          throw new NotFoundException('Team not found');
        }

        if (team.leaderId !== user.sub) {
          throw new ForbiddenException(
            'You do not have permission to update this team',
          );
        }

        // Leader can only update description, icon, memberIds
        const bodyKeys = Object.keys(request.body || {});
        const allowedKeys = ['description', 'icon', 'memberIds'];
        const unauthorizedKeys = bodyKeys.filter(
          (k) => !allowedKeys.includes(k),
        );

        if (unauthorizedKeys.length > 0) {
          throw new ForbiddenException(
            `Team leaders may only update description, icon, and memberIds. Disallowed fields: ${unauthorizedKeys.join(', ')}`,
          );
        }

        return true;
      }

      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }

    return true;
  }
}

