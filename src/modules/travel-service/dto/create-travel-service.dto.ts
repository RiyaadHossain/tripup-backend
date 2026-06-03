import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTravelServiceDto {
  @IsOptional()
  @IsUUID()
  serviceCategory?: string;

  @IsString()
  @MaxLength(150)
  slug!: string;

  @IsString()
  @MaxLength(150)
  title!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  navLinsDesc?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  icon?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @IsString()
  serviceCategoryId?: string;

  @IsOptional()
  @IsBoolean()
  comingSoon?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsObject()
  hero!: Record<string, unknown>;

  @IsObject()
  problem!: Record<string, unknown>;

  @IsObject()
  capabilities!: Record<string, unknown>;

  @IsObject()
  process!: Record<string, unknown>;

  @IsObject()
  deliverables!: Record<string, unknown>;

  @IsObject()
  outcomes!: Record<string, unknown>;

  @IsObject()
  audience!: Record<string, unknown>;

  @IsObject()
  whyUs!: Record<string, unknown>;

  @IsObject()
  faq!: Record<string, unknown>;

  @IsObject()
  cta!: Record<string, unknown>;
}
