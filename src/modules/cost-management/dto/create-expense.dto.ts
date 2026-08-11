import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsObject,
  IsString,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { ExpenseStatus, PaymentMethod } from 'generated/src/prisma/client';

export class CreateExpenseDto {
  @IsString()
  @MaxLength(500)
  description: string;

  @IsString()
  @MaxLength(255)
  category: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsEnum(ExpenseStatus)
  status: ExpenseStatus;

  @IsDateString()
  expenseDate: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  paidBy?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  vendor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  vendorContact?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  reference?: string;

  @IsOptional()
  @IsObject()
  attachment?: {
    name: string;
    type: string;
    size: number;
    url: string;
  };

  @IsOptional()
  @IsString()
  notes?: string;
}
