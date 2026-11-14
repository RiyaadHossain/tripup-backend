import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAchievementDto {
  @IsString()
  @IsNotEmpty({ message: 'name is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'recipientId is required' })
  recipientId: string;

  @IsString()
  @IsNotEmpty({ message: 'date is required' })
  date: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  badgeId?: string;
}

