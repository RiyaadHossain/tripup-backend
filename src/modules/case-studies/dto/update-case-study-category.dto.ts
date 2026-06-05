import { PartialType } from '@nestjs/mapped-types';
import { CreateCaseStudyCategoryDto } from './create-case-study-category.dto';

export class UpdateCaseStudyCategoryDto extends PartialType(
  CreateCaseStudyCategoryDto,
) {}
