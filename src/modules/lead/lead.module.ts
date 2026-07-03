import { Module } from '@nestjs/common';
import { LeadsService } from './services/leads.service';
import { AdminLeadsController } from './controllers/admin-leads.controller';
import { LeadsRepository } from './repositories/leads.repository';

@Module({
  controllers: [AdminLeadsController],
  providers: [LeadsService, LeadsRepository],
  exports: [LeadsService],
})
export class LeadModule {}
