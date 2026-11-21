import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTaskCommentDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  @IsIn(['html', 'plain'])
  contentFormat?: string = 'html';

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  mentionedUserIds?: string[];
}
