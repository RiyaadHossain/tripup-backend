import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { LeadStatus, LeadPriority, LeadSource } from 'generated/src/prisma/client';

export class CreateLeadDto {
  @IsOptional()
  @IsBoolean()
  isPotential?: boolean;

  @IsString()
  @MaxLength(255)
  businessName: string;

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
}
