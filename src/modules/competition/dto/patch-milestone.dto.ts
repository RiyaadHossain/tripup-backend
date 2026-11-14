import { PartialType } from '@nestjs/mapped-types';
import { CreateMilestoneDto } from './create-milestone.dto';

export class PatchMilestoneDto extends PartialType(CreateMilestoneDto) {}

