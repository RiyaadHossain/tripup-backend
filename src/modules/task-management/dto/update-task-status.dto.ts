import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { TaskStatus } from 'generated/src/prisma/client';

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus)
  status!: TaskStatus;
}
