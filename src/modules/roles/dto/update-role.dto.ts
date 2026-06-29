import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './create-role.dto';

/**
 * All fields from CreateRoleDto are optional.
 * When permissionIds is provided it REPLACES the current permission set atomically.
 * Omitting permissionIds leaves the current permissions untouched.
 */
export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
