import { IsString, MaxLength } from 'class-validator';

export class CreateCaseStudyCategoryDto {
  @IsString()
  @MaxLength(100)
  name!: string;
}
