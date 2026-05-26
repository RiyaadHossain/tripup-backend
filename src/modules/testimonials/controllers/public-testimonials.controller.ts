import { Controller, Get, Query } from '@nestjs/common';

import { TestimonialsService } from '../services/testimonials.service';

import { QueryTestimonialDto } from '../dto/query-testimonial.dto';

@Controller('testimonials')
export class PublicTestimonialsController {
  constructor(private readonly service: TestimonialsService) {}

  @Get()
  async findAll(@Query() query: QueryTestimonialDto) {
    return this.service.findAll({
      ...query,
      isPublished: 'true',
    });
  }
}
