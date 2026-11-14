import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpsertPerformanceDto {
  @IsString()
  @IsNotEmpty({ message: 'employeeId is required' })
  employeeId: string;

  @IsString()
  @IsNotEmpty({ message: 'month is required' })
  month: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  leads?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  converted?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  consistency?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  contribution?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  streak?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  revenue?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  tasks?: number;
}

