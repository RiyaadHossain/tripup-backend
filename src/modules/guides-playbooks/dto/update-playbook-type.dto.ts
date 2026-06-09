import { PartialType } from '@nestjs/mapped-types';
import { CreatePlaybookTypeDto } from './create-playbook-type.dto';

export class UpdatePlaybookTypeDto extends PartialType(CreatePlaybookTypeDto) {}
