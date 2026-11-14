import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  Cadence,
  ChallengeParameter,
  ChallengeType,
} from '../enums/competition.enums';
import { ScoringRulesDto } from './scoring-rules.dto';

export class ChallengeTargetDto {
  @IsEnum(ChallengeParameter, {
    message: 'metric must be leads, converted, or revenue',
  })
  metric: ChallengeParameter;

  @IsNumber()
  @Min(0.0001, { message: 'target must be greater than 0' })
  target: number;
}

export class CreateChallengeDto {
  @IsString()
  @IsNotEmpty({ message: 'Challenge name is required' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ChallengeType, {
    message: 'type must be acquisition, conversion, or balanced',
  })
  type: ChallengeType;

  @IsEnum(Cadence, {
    message: 'cadence must be Monthly, Quarterly, or Yearly',
  })
  cadence: Cadence;

  @IsString()
  @IsNotEmpty({ message: 'Start date is required' })
  start: string;

  @IsString()
  @IsNotEmpty({ message: 'End date is required' })
  end: string;

  @IsArray({ message: 'teamIds must be an array' })
  @ArrayMinSize(1, { message: 'Challenge must have at least 1 team' })
  @IsString({ each: true, message: 'Each teamId must be a string' })
  teamIds: string[];

  @IsArray({ message: 'targets must be an array' })
  @ArrayMinSize(1, { message: 'Challenge must have at least 1 target' })
  @ValidateNested({ each: true })
  @Type(() => ChallengeTargetDto)
  targets: ChallengeTargetDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ScoringRulesDto)
  rules?: ScoringRulesDto;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  reward?: string;
}

