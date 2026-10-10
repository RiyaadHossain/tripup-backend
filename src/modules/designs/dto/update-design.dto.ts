import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { DesignImageDto } from './design-image.dto';

export class UpdateDesignDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'Design title is required' })
  @IsString({ message: 'Design title is required' })
  @MaxLength(140, { message: 'Title must not exceed 140 characters' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Slug must be a string' })
  @MaxLength(160, { message: 'Slug must not exceed 160 characters' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'Slug must be lowercase and contain only alphanumeric characters and hyphens',
  })
  slug?: string;

  @IsOptional()
  @IsArray({ message: 'At least one image is required' })
  @ArrayNotEmpty({ message: 'At least one image is required' })
  @ValidateNested({ each: true })
  @Type(() => DesignImageDto)
  images?: DesignImageDto[];

  @IsOptional()
  @MaxLength(120, { message: 'Client name must not exceed 120 characters' })
  clientName?: string | null;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'deliveryDate must be YYYY-MM-DD',
  })
  deliveryDate?: string | null;

  @IsOptional()
  @IsBoolean({ message: 'isPublished must be a boolean' })
  isPublished?: boolean;
}
