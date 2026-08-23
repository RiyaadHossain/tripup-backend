import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Database
import { DatabaseModule } from './database/database.module';

// Mail
import { MailModule } from './modules/mail/mail.module';

// Auth & RBAC
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';

// Content modules
import { TeamMembersModule } from './modules/team-members/team-members.module';
import { TestimonialsModule } from './modules/testimonials/testimonials.module';
import { TravelInsightModule } from './modules/travel-insight/travel-insight.module';
import { TravelServiceModule } from './modules/travel-service/travel-service.module';
import { CaseStudiesModule } from './modules/case-studies/case-studies.module';
import { GuidesPlaybooksModule } from './modules/guides-playbooks/guides-playbooks.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { LeadModule } from './modules/lead/lead.module';
import { CostManagementModule } from './modules/cost-management/cost-management.module';
import { UserActivityModule } from './modules/user-activity/user-activity.module';
import { TaskManagementModule } from './modules/task-management/task-management.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    MailModule,

    // Auth & RBAC — register before feature modules so guards can be injected
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,

    // Content & feature modules
    TeamMembersModule,
    TestimonialsModule,
    TravelInsightModule,
    TravelServiceModule,
    CaseStudiesModule,
    GuidesPlaybooksModule,
    UploadsModule,
    LeadModule,
    CostManagementModule,
    UserActivityModule,
    TaskManagementModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
