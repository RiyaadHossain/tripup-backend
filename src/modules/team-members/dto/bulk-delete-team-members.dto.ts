import { ArrayMinSize, IsArray } from 'class-validator';

export class BulkDeleteTeamMembersDto {
  @IsArray()
  @ArrayMinSize(1)
  ids!: string[];
}
