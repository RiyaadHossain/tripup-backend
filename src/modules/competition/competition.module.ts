import { Module } from '@nestjs/common';
import { CompetitionController } from './controllers/competition.controller';
import { CompetitionService } from './services/competition.service';
import { CompetitionPermissionGuard } from './guards/competition-permission.guard';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [CompetitionController],
  providers: [CompetitionService, CompetitionPermissionGuard],
  exports: [CompetitionService],
})
export class CompetitionModule {}

