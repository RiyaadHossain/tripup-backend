import { PartialType } from '@nestjs/mapped-types';
import { CreateChallengeDto } from './create-challenge.dto';

export class PatchChallengeDto extends PartialType(CreateChallengeDto) {}

