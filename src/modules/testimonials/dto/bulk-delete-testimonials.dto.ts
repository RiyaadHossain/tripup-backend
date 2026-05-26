import { IsArray, IsString } from 'class-validator';

export class BulkDeleteTestimonialsDto {
  @IsArray()
  @IsString({ each: true })
  ids!: string[];
}
