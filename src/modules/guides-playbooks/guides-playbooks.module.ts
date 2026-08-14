import { Module } from '@nestjs/common';
import { PublicPlaybooksController } from './controllers/public-playbooks.controller';
import { AdminPlaybooksController } from './controllers/admin-playbooks.controller';
import { AdminPlaybookCategoriesController } from './controllers/admin-playbook-categories.controller';
import { AdminPlaybookTypesController } from './controllers/admin-playbook-types.controller';
import { PlaybookService } from './services/playbooks.service';
import { PlaybookCategoriesService } from './services/playbook-categories.service';
import { PlaybookTypesService } from './services/playbook-types.service';
import { PlaybookRepository } from './repositories/playbooks.repository';
import { PlaybookCategoriesRepository } from './repositories/playbook-categories.repository';
import { PlaybookTypesRepository } from './repositories/playbook-types.repository';
import { UserActivityModule } from 'src/modules/user-activity/user-activity.module';

@Module({
  imports: [UserActivityModule],
  controllers: [
    PublicPlaybooksController,
    AdminPlaybooksController,
    AdminPlaybookCategoriesController,
    AdminPlaybookTypesController,
  ],
  providers: [
    PlaybookService,
    PlaybookCategoriesService,
    PlaybookTypesService,
    PlaybookRepository,
    PlaybookCategoriesRepository,
    PlaybookTypesRepository,
  ],
})
export class GuidesPlaybooksModule {}
