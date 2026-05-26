import { PartialType } from '@nestjs/mapped-types';
import { CreateTravelInsightDto } from './create-travel-insight.dto';

export class UpdateTravelInsightDto extends PartialType(CreateTravelInsightDto) {}
