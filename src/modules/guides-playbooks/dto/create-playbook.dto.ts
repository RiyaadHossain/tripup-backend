import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class FrameworkStepDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;
}

export class SamplePreviewDto {
  @IsString()
  title!: string;

  @IsArray()
  @IsString({ each: true })
  items!: string[];
}

export class RelatedServiceDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsString()
  to!: string;
}

export class CreatePlaybookDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(200)
  slug!: string;

  @IsString()
  excerpt!: string;

  @IsString()
  date!: string;

  @IsString()
  readingTime!: string;

  @IsString()
  author!: string;

  @IsString()
  bestFor!: string;

  @IsString()
  ctaLabel!: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsArray()
  @IsString({ each: true })
  keyTakeaways!: string[];

  @IsArray()
  @IsString({ each: true })
  whoIsItFor!: string[];

  @IsArray()
  @IsString({ each: true })
  outcomes!: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FrameworkStepDto)
  frameworkSteps!: FrameworkStepDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SamplePreviewDto)
  samplePreviews!: SamplePreviewDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RelatedServiceDto)
  relatedServices!: RelatedServiceDto[];

  @IsOptional()
  @IsUUID('4')
  type?: string;

  @IsOptional()
  @IsUUID('4')
  category?: string;
}
