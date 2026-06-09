import { IsString, MaxLength } from 'class-validator';

export class CreatePlaybookTypeDto {
  @IsString()
  @MaxLength(100)
  name!: string;
}
