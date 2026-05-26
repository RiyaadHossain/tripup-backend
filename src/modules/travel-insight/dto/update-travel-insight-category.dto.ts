import { PartialType } from '@nestjs/mapped-types';
import { CreateTravelInsightCategoryDto } from './create-travel-insight-category.dto';

export class UpdateTravelInsightCategoryDto extends PartialType(
  CreateTravelInsightCategoryDto,
) {}
