import { IsDateString, IsEnum, IsNumber, IsObject, IsOptional, IsString, MaxLength } from "class-validator";
import { ExpenseStatus, PaymentMethod } from "generated/src/prisma/enums";

export class UpdateExpenseDto {
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    category?: string;

    @IsOptional()
    @IsNumber()
    amount?: number;

    @IsOptional()
    @IsString()
    @MaxLength(3)
    currency?: string;

    @IsOptional()
    @IsEnum(ExpenseStatus)
    status?: ExpenseStatus;

    @IsOptional()
    @IsDateString()
    expenseDate?: string;

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
