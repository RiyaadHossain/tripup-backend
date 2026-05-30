import { IsString, MaxLength } from 'class-validator';

export class CreateServiceCategoryDto {
  @IsString()
  @MaxLength(100)
  name!: string;
}
