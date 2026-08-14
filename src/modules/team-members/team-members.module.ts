import { Module } from '@nestjs/common';
import { PublicTeamMembersController } from './controllers/public-team-members.controller';
import { AdminTeamMembersController } from './controllers/admin-team-members.controller';
import { TeamMembersService } from './services/team-members.service';
import { UserActivityModule } from 'src/modules/user-activity/user-activity.module';

@Module({
  imports: [UserActivityModule],
  controllers: [PublicTeamMembersController, AdminTeamMembersController],
  providers: [TeamMembersService],
})
export class TeamMembersModule {}
