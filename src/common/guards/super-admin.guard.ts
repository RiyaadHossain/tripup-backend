import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { SUPER_ADMIN_ROLE } from '../constants/permissions.constant';
import { JwtPayload } from 'src/modules/auth/interfaces/jwt-payload.interface';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user: JwtPayload }>();
    const user = request.user;

    if (!user || user.role !== SUPER_ADMIN_ROLE) {
      throw new ForbiddenException('Only Super Admin can perform this action');
    }

    return true;
  }
}
