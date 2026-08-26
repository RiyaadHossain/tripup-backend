import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

/**
 * Self-contained read-only analytics module.
 *
 * PrismaService is provided globally via DatabaseModule (@Global),
 * so it does not need to be listed here explicitly.
 *
 * AuthModule is imported to make JwtService available to JwtAuthGuard.
 */
@Module({
  imports: [AuthModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
