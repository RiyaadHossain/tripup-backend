import { IsString, MaxLength } from 'class-validator';

export class CreateTravelInsightCategoryDto {
  @IsString()
  @MaxLength(100)
  name!: string;
}
