import { PartialType } from '@nestjs/mapped-types';
import { CreateBadgeDto } from './create-badge.dto';

export class PatchBadgeDto extends PartialType(CreateBadgeDto) {}

