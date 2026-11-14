import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { TargetMetric } from '../enums/competition.enums';

export class CreateBadgeDto {
  @IsString()
  @IsNotEmpty({ message: 'title is required' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty({ message: 'icon is required' })
  icon: string;

  @IsEnum(TargetMetric, {
    message: 'metric must be leads, converted, revenue, tasks, or streak',
  })
  metric: TargetMetric;

  @IsNumber()
  @Min(0.0001, { message: 'target must be greater than 0' })
  target: number;
}

