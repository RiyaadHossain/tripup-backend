import { Module } from '@nestjs/common';
import { PublicTestimonialsController } from './controllers/public-testimonials.controller';
import { AdminTestimonialsController } from './controllers/admin-testimonials.controller';
import { TestimonialsService } from './services/testimonials.service';
import { TestimonialsRepository } from './repositories/testimonials.repository';
import { UserActivityModule } from 'src/modules/user-activity/user-activity.module';

@Module({
  imports: [UserActivityModule],
  controllers: [PublicTestimonialsController, AdminTestimonialsController],
  providers: [TestimonialsService, TestimonialsRepository],
})
export class TestimonialsModule {}
