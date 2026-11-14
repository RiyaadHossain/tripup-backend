import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class FinalizeWinnerDto {
  @IsString()
  @IsNotEmpty({ message: 'month is required' })
  @Matches(/^\d{4}-\d{2}$/, { message: 'month must be in YYYY-MM format' })
  month: string;
}

