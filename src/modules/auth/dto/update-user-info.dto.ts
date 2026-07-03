import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserInfoDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
