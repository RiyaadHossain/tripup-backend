import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

class TravelInsightSeoDto {
  @IsString()
  @MaxLength(160)
  metaTitle!: string;

  @IsString()
  @MaxLength(255)
  metaDescription!: string;
}

export class CreateTravelInsightDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  description!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  timeReadMin!: number;

  @IsString()
  @MaxLength(100)
  author!: string;

  @IsUrl()
  coverImgUrl!: string;

  @IsString()
  content!: string;

  @IsArray()
  @IsString({ each: true })
  insights!: string[];

  @IsArray()
  @IsString({ each: true })
  takeAway!: string[];

  @IsObject()
  @ValidateNested()
  @Type(() => TravelInsightSeoDto)
  seo!: TravelInsightSeoDto;

  @IsArray()
  @IsString({ each: true })
  tags!: string[];

  @IsOptional()
  @IsUUID('4')
  category?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  relatedServices?: string[];

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
