import { Module } from '@nestjs/common';
import { TeamMembersModule } from './modules/team-members/team-members.module';
import { DatabaseModule } from './database/database.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TeamMembersModule,
    DatabaseModule,
    UploadsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
