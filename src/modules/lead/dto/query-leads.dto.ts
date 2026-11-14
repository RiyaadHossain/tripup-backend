import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import {
  LeadStatus,
  LeadPriority,
  LeadSource,
} from 'generated/src/prisma/client';

export class QueryLeadsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  /** Filter by exact status (any LeadStatus) */
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  /** Filter specifically by an action-based status */
  @IsOptional()
  @IsEnum(LeadStatus)
  actionStatus?: LeadStatus;

  /** Filter specifically by a result-based status */
  @IsOptional()
  @IsEnum(LeadStatus)
  resultStatus?: LeadStatus;

  /** Filter by category of status: ACTION or RESULT */
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  @IsEnum(['ACTION', 'RESULT'], {
    message: 'statusCategory must be either ACTION or RESULT',
  })
  statusCategory?: 'ACTION' | 'RESULT';

  @IsOptional()
  @IsEnum(LeadPriority)
  priority?: LeadPriority;

  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  isPotential?: boolean;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  niche?: string;

  @IsOptional()
  @IsString()
  recommendedOpportunity?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  strength?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  minStrength?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  maxStrength?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  qualification?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  minQualification?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  maxQualification?: number;

  @IsOptional()
  @IsString()
  proposedService?: string;

  @IsOptional()
  @IsString()
  addedById?: string;

  @IsOptional()
  @IsString()
  assignedToId?: string;

  // Date Added / Sourced filters
  @IsOptional()
  @IsDateString()
  dateAddedFrom?: string;

  @IsOptional()
  @IsDateString()
  dateAddedTo?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  // Last Activity Date filters
  @IsOptional()
  @IsDateString()
  lastActivityFrom?: string;

  @IsOptional()
  @IsDateString()
  lastActivityTo?: string;

  // Conversion Date filters
  @IsOptional()
  @IsDateString()
  convertedFrom?: string;

  @IsOptional()
  @IsDateString()
  convertedTo?: string;

  // Sorting
  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value))
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
