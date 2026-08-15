import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { Permission } from 'src/common/decorators/permission.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { perm } from 'src/common/constants/permissions.constant';
import { UserActivityService } from './user-activity.service';
import { QueryActivitiesDto } from './dto/query-activities.dto';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('admin/activities')
export class UserActivityController {
  constructor(private readonly service: UserActivityService) {}

  /**
   * GET /admin/activities/me
   * Returns the authenticated user's own activity feed.
   */
  @Get('me')
  @Permission(perm('user_activity', 'READ'))
  findMine(
    @CurrentUser('sub') userId: string,
    @Query() query: QueryActivitiesDto,
  ) {
    return this.service.findMine(userId, query);
  }

  /**
   * GET /admin/activities/user/:userId
   * Returns activity feed for any user (admin/supervisor use case).
   */
  @Get('user/:userId')
  @Permission(perm('user_activity', 'READ'))
  findByUser(
    @Param('userId') userId: string,
    @Query() query: QueryActivitiesDto,
  ) {
    return this.service.findByUser(userId, query); 
  }
}
