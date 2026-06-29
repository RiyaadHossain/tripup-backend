import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  /**
   * UUIDs of permissions to attach to this role.
   * Fetch the available permission IDs from GET /permissions.
   */
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  permissionIds?: string[];
}
