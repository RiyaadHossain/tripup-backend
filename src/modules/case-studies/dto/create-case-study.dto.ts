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

class MetricDto {
  @IsString()
  value!: string;

  @IsString()
  label!: string;
}

class SnapshotDto {
  @IsString()
  clientType!: string;

  @IsString()
  serviceScope!: string;

  @IsString()
  timeline!: string;

  @IsString()
  primaryGoal!: string;

  @IsString()
  platform!: string;
}

class ChallengeDto {
  @IsString()
  intro!: string;

  @IsArray()
  @IsString({ each: true })
  points!: string[];
}

class ApproachStepDto {
  @IsString()
  number!: string;

  @IsString()
  title!: string;

  @IsString()
  desc!: string;
}

class TransformationDto {
  @IsArray()
  @IsString({ each: true })
  before!: string[];

  @IsArray()
  @IsString({ each: true })
  after!: string[];
}

class ResultDto {
  @IsString()
  value!: string;

  @IsString()
  label!: string;
}

class TestimonialDto {
  @IsString()
  quote!: string;

  @IsString()
  name!: string;

  @IsString()
  role!: string;

  @IsString()
  brand!: string;
}

export class CreateCaseStudyDto {
  @IsString()
  @MaxLength(800)
  title!: string;

  @IsString()
  @MaxLength(800)
  slug!: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsString()
  readingTime!: string;

  @IsString()
  ctaLabel!: string;

  @IsOptional()
  @IsString()
  industryTag?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetricDto)
  metrics?: MetricDto[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SnapshotDto)
  snapshot?: SnapshotDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ChallengeDto)
  challenge?: ChallengeDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApproachStepDto)
  approachSteps!: ApproachStepDto[];

  @IsArray()
  @IsString({ each: true })
  deliverables!: string[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TransformationDto)
  transformation?: TransformationDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResultDto)
  results?: ResultDto[];

  @IsArray()
  @IsString({ each: true })
  keyTakeaways!: string[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TestimonialDto)
  testimonial?: TestimonialDto;

  @IsOptional()
  @IsUUID('4')
  category?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
