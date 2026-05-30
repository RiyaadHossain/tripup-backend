import { ArrayMinSize, IsArray } from 'class-validator';

export class BulkDeleteTravelServicesDto {
  @IsArray()
  @ArrayMinSize(1)
  ids!: string[];
}
