import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { LeadStatus } from 'generated/src/prisma/client';

export class CreateLeadDto {
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
