import { Module } from '@nestjs/common';
import { DesignsController } from './controllers/designs.controller';
import { AdminDesignsController } from './controllers/admin-designs.controller';
import { DesignsService } from './services/designs.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [DesignsController, AdminDesignsController],
  providers: [DesignsService],
  exports: [DesignsService],
})
export class DesignsModule {}
