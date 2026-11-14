import { IsOptional, IsString } from 'class-validator';

export class AssignLeadDto {
  /**
   * ID of user to assign to, or null/empty string to unassign
   */
  @IsOptional()
  @IsString()
  assignedToId?: string | null;

  @IsOptional()
  @IsString()
  notes?: string;
}

