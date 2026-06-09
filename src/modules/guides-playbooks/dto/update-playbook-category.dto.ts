import { PartialType } from '@nestjs/mapped-types';
import { CreatePlaybookCategoryDto } from './create-playbook-category.dto';

export class UpdatePlaybookCategoryDto extends PartialType(CreatePlaybookCategoryDto) {}
