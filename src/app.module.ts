import { Module } from '@nestjs/common';
import { TeamMembersModule } from './modules/team-members/team-members.module';
import { DatabaseModule } from './database/database.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { TestimonialsModule } from './modules/testimonials/testimonials.module';
import { ConfigModule } from '@nestjs/config';
import { TravelInsightModule } from './modules/travel-insight/travel-insight.module';
import { TravelServiceModule } from './modules/travel-service/travel-service.module';
import { CaseStudiesModule } from './modules/case-studies/case-studies.module';
import { GuidesPlaybooksModule } from './modules/guides-playbooks/guides-playbooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TeamMembersModule,
    DatabaseModule,
    UploadsModule,
    TestimonialsModule,
    TravelInsightModule,
    TravelServiceModule,
    CaseStudiesModule,
    GuidesPlaybooksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

