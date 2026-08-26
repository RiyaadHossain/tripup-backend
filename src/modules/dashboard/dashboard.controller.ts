import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { Permission } from 'src/common/decorators/permission.decorator';
import { perm } from 'src/common/constants/permissions.constant';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { TrendQueryDto } from './dto/trend-query.dto';

/**
 * Read-only Admin Dashboard analytics controller.
 *
 * All endpoints require a valid JWT Bearer token and the
 * `dashboard.read` permission (or Super Admin role).
 *
 * Base path: /api/v1/admin/dashboard
 */
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /admin/dashboard/overview
   *
   * Returns the full dashboard payload:
   *   overview, leads, financials, tasks, content, team, recentActivity
   *
   * Optional query params:
   *   from (ISO date) — start of date range for time-sensitive metrics
   *   to   (ISO date) — end of date range for time-sensitive metrics
   */
  @Get('overview')
  @Permission(perm('dashboard', 'READ'))
  async getOverview(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getOverview(query);
  }

  /**
   * GET /admin/dashboard/leads/trend
   *
   * Returns lead acquisition counts grouped over time.
   *
   * Query param:
   *   period — '7d' | '30d' | '90d' | '6m' | '1y'  (default: 30d)
   *
   * Grouping:
   *   7d / 30d → daily
   *   90d      → weekly
   *   6m / 1y  → monthly
   */
  @Get('leads/trend')
  @Permission(perm('dashboard', 'READ'))
  async getLeadTrend(@Query() query: TrendQueryDto) {
    return this.dashboardService.getLeadTrend(query);
  }

  /**
   * GET /admin/dashboard/financials/trend
   *
   * Returns aggregated expense amounts over time.
   *
   * Query param:
   *   period — '7d' | '30d' | '90d' | '6m' | '1y'  (default: 30d)
   */
  @Get('financials/trend')
  @Permission(perm('dashboard', 'READ'))
  async getFinancialTrend(@Query() query: TrendQueryDto) {
    return this.dashboardService.getFinancialTrend(query);
  }
}
