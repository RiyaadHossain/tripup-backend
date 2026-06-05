import { ArrayMinSize, IsArray } from 'class-validator';

export class BulkDeleteCaseStudiesDto {
  @IsArray()
  @ArrayMinSize(1)
  ids!: string[];
}
