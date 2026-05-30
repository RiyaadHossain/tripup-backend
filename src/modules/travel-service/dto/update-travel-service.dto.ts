import { PartialType } from '@nestjs/mapped-types';
import { CreateTravelServiceDto } from './create-travel-service.dto';

export class UpdateTravelServiceDto extends PartialType(
  CreateTravelServiceDto,
) {}
