import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { LeadActivityType } from 'generated/src/prisma/client';

export class CreateLeadActivityDto {
  @IsEnum(LeadActivityType)
  type: LeadActivityType;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

