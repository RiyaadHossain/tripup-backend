import { IsNotEmpty, IsOptional, IsString, MaxLength, Matches } from 'class-validator';

export class DesignImageDto {
  @IsNotEmpty({ message: 'Each image must include a url' })
  @IsString({ message: 'Each image must include a url' })
  @Matches(/^https:\/\/.+/i, {
    message: 'Each image url must be an absolute https URL',
  })
  url: string;

  @IsOptional()
  @IsString({ message: 'Image alt text must be a string' })
  @MaxLength(200, { message: 'Image alt text must not exceed 200 characters' })
  alt?: string;
}
