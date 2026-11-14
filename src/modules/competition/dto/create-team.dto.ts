import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty({ message: 'Team name is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Category is required' })
  category: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty({ message: 'Leader ID is required' })
  leaderId: string;

  @IsArray({ message: 'memberIds must be an array of user IDs' })
  @ArrayMinSize(1, { message: 'Team must have at least 1 member' })
  @IsString({ each: true, message: 'Each member ID must be a string' })
  memberIds: string[];

  @IsString()
  @IsNotEmpty({ message: 'Icon is required' })
  icon: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  annualGoal?: number;
}

