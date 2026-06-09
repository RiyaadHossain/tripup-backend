import { IsString, MaxLength } from 'class-validator';

export class CreatePlaybookCategoryDto {
  @IsString()
  @MaxLength(100)
  name!: string;
}
