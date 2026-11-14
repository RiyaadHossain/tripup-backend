import { Module } from '@nestjs/common';
import { CompetitionController } from './controllers/competition.controller';
import { CompetitionService } from './services/competition.service';
import { CompetitionPermissionGuard } from './guards/competition-permission.guard';

@Module({
  controllers: [CompetitionController],
  providers: [CompetitionService, CompetitionPermissionGuard],
  exports: [CompetitionService],
})
export class CompetitionModule {}

