import { ArrayMinSize, IsArray } from 'class-validator';

export class BulkDeleteTravelInsightsDto {
  @IsArray()
  @ArrayMinSize(1)
  ids!: string[];
}
