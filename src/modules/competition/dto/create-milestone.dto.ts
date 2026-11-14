import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { MilestoneMetric } from '../enums/competition.enums';

export class CreateMilestoneDto {
  @IsString()
  @IsNotEmpty({ message: 'title is required' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(MilestoneMetric, {
    message: 'metric must be leads, converted, revenue, or tasks',
  })
  metric: MilestoneMetric;

  @IsNumber()
  @Min(0.0001, { message: 'target must be greater than 0' })
  target: number;

  @IsString()
  @IsNotEmpty({ message: 'start date is required' })
  start: string;

  @IsString()
  @IsNotEmpty({ message: 'end date is required' })
  end: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

