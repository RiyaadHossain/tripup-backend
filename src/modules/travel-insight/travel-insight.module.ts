import { Module } from '@nestjs/common';
import { PublicTravelInsightController } from './controllers/public-travel-insight.controller';
import { AdminTravelInsightController } from './controllers/admin-travel-insight.controller';
import { AdminTravelInsightCategoriesController } from './controllers/admin-travel-insight-categories.controller';
import { TravelInsightService } from './services/travel-insight.service';
import { TravelInsightCategoriesService } from './services/travel-insight-categories.service';
import { TravelInsightRepository } from './repositories/travel-insight.repository';
import { TravelInsightCategoriesRepository } from './repositories/travel-insight-categories.repository';
import { UserActivityModule } from 'src/modules/user-activity/user-activity.module';

@Module({
  imports: [UserActivityModule],
  controllers: [
    PublicTravelInsightController,
    AdminTravelInsightController,
    AdminTravelInsightCategoriesController,
  ],
  providers: [
    TravelInsightService,
    TravelInsightCategoriesService,
    TravelInsightRepository,
    TravelInsightCategoriesRepository,
  ],
})
export class TravelInsightModule {}
