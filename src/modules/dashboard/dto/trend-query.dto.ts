import { IsEnum } from 'class-validator';

export type TrendPeriod = '7d' | '30d' | '90d' | '6m' | '1y';

export const TREND_PERIODS = ['7d', '30d', '90d', '6m', '1y'] as const;

export class TrendQueryDto {
  @IsEnum(TREND_PERIODS, {
    message: `period must be one of: ${TREND_PERIODS.join(', ')}`,
  })
  period: TrendPeriod = '30d';
}
