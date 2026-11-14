import { IsNumber, Min } from 'class-validator';

export class ScoringRulesDto {
  @IsNumber()
  @Min(0, { message: 'lead must be at least 0' })
  lead: number;

  @IsNumber()
  @Min(0, { message: 'conversion must be at least 0' })
  conversion: number;

  @IsNumber()
  @Min(0, { message: 'consistency must be at least 0' })
  consistency: number;

  @IsNumber()
  @Min(0, { message: 'contribution must be at least 0' })
  contribution: number;

  @IsNumber()
  @Min(0, { message: 'target must be at least 0' })
  target: number;

  @IsNumber()
  @Min(0, { message: 'win must be at least 0' })
  win: number;
}

