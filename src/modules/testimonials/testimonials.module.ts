import { Module } from '@nestjs/common';
import { PublicTestimonialsController } from './controllers/public-testimonials.controller';
import { AdminTestimonialsController } from './controllers/admin-testimonials.controller';
import { TestimonialsService } from './services/testimonials.service';
import { TestimonialsRepository } from './repositories/testimonials.repository';

@Module({
  imports: [],
  controllers: [PublicTestimonialsController, AdminTestimonialsController],
  providers: [TestimonialsService, TestimonialsRepository],
})
export class TestimonialsModule {}
