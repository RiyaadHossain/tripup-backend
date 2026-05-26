import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTestimonialDto {
  @IsString()
  testimony!: string;

  @IsString()
  @MaxLength(100)
  userName!: string;

  @IsOptional()
  @IsUrl()
  userImg?: string;

  @IsString()
  @MaxLength(100)
  designation!: string;

  @IsString()
  @MaxLength(100)
  company!: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}
