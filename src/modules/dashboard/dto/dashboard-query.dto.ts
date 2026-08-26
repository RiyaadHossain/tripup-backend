import { IsOptional, IsDateString } from 'class-validator';

/**
 * Query parameters for the dashboard overview endpoint.
 * Date-sensitive metrics (leads, expenses, tasks, recent content/activity)
 * are filtered to [from, to] when supplied.
 * Lifetime totals (team, content counts) are always unfiltered.
 */
export class DashboardQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
