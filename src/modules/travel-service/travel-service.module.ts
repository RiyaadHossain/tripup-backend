import { Module } from '@nestjs/common';

import { AdminServiceCategoriesController } from './controllers/admin-service-categories.controller';
import { AdminTravelServicesController } from './controllers/admin-travel-services.controller';
import { PublicTravelServicesController } from './controllers/public-travel-services.controller';
import { ServiceCategoriesService } from './services/service-categories.service';
import { TravelServicesService } from './services/travel-services.service';

@Module({
  imports: [],
  controllers: [
    PublicTravelServicesController,
    AdminTravelServicesController,
    AdminServiceCategoriesController,
  ],
  providers: [TravelServicesService, ServiceCategoriesService],
})
export class TravelServiceModule {}
