import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LeadStatus, LeadPriority, LeadSource } from 'generated/src/prisma/client';

export class CreateLeadDto {
  @IsString()
  @MaxLength(255)
  businessName: string;

  @IsOptional()
  @IsBoolean()
  isPotential?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @IsOptional()
  @IsEnum(LeadPriority)
  priority?: LeadPriority;

  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  niche?: string;

  @IsOptional()
  @IsUrl()
  facebookLink?: string;

  @IsOptional()
  @IsUrl()
  linkedInLink?: string;

  @IsOptional()
  @IsUrl()
  instagramLink?: string;

  @IsOptional()
  @IsUrl()
  twitterLink?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  contactPerson?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  /**
   * Selected opportunity from predefined list, or custom value if "Other"
   */
  @IsOptional()
  @IsString()
  recommendedOpportunity?: string;

  /**
   * Alias / legacy name for recommendedOpportunity to safely support migration
   */
  @IsOptional()
  @IsString()
  clientGap?: string;

  /**
   * Numeric rating from 1 to 5
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  strength?: number;

  /**
   * Numeric score from 1 to 5
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  qualification?: number;

  /**
   * Description of service or solution proposed to prospect
   */
  @IsOptional()
  @IsString()
  proposedService?: string;

  /**
   * ID of user assigned to this lead
   */
  @IsOptional()
  @IsString()
  assignedToId?: string;
}
