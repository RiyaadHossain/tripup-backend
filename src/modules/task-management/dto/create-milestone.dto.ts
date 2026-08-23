import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMilestoneDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
