import { IsBoolean } from 'class-validator';

export class ArchiveChallengeDto {
  @IsBoolean()
  archived: boolean;
}

