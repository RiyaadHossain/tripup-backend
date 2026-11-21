import { Module } from '@nestjs/common';
import { LeadsService } from './services/leads.service';
import { AdminLeadsController } from './controllers/admin-leads.controller';
import { LeadsRepository } from './repositories/leads.repository';
import { UserActivityModule } from 'src/modules/user-activity/user-activity.module';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';

@Module({
  controllers: [AdminLeadsController],
  providers: [LeadsService, LeadsRepository],
  exports: [LeadsService],
  imports: [UserActivityModule, NotificationsModule],
})
export class LeadModule {}
