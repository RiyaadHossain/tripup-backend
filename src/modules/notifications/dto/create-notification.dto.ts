import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { NotificationType } from 'generated/src/prisma/client';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId: string; // Recipient

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsString()
  module?: string;

  @IsOptional()
  @IsString()
  resourceId?: string;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  triggeredById?: string;
}

export class SendBroadcastNotificationDto {
  @IsOptional()
  userIds?: string[]; // If omitted or empty, sends to all active users

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsString()
  module?: string;

  @IsOptional()
  @IsString()
  resourceId?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
