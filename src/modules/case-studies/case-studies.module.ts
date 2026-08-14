import { Module } from '@nestjs/common';
import { PublicCaseStudiesController } from './controllers/public-case-studies.controller';
import { AdminCaseStudiesController } from './controllers/admin-case-studies.controller';
import { AdminCaseStudyCategoriesController } from './controllers/admin-case-study-categories.controller';
import { CaseStudyService } from './services/case-study.service';
import { CaseStudyCategoriesService } from './services/case-study-categories.service';
import { CaseStudyRepository } from './repositories/case-study.repository';
import { CaseStudyCategoriesRepository } from './repositories/case-study-categories.repository';
import { UserActivityModule } from 'src/modules/user-activity/user-activity.module';

@Module({
  imports: [UserActivityModule],
  controllers: [
    PublicCaseStudiesController,
    AdminCaseStudiesController,
    AdminCaseStudyCategoriesController,
  ],
  providers: [
    CaseStudyService,
    CaseStudyCategoriesService,
    CaseStudyRepository,
    CaseStudyCategoriesRepository,
  ],
})
export class CaseStudiesModule {}
