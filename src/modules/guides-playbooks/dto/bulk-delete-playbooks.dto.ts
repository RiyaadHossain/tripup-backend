import { IsArray, IsUUID } from 'class-validator';

export class BulkDeletePlaybooksDto {
  @IsArray()
  @IsUUID('4', { each: true })
  ids!: string[];
}
