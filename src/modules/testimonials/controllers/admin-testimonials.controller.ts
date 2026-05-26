import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { TestimonialsService } from '../services/testimonials.service';

import { CreateTestimonialDto } from '../dto/create-testimonial.dto';
import { UpdateTestimonialDto } from '../dto/update-testimonial.dto';
import { QueryTestimonialDto } from '../dto/query-testimonial.dto';
import { BulkDeleteTestimonialsDto } from '../dto/bulk-delete-testimonials.dto';

@Controller('admin/testimonials')
export class AdminTestimonialsController {
  constructor(private readonly service: TestimonialsService) {}

  @Post()
  async create(@Body() dto: CreateTestimonialDto) {
    return this.service.create(dto);
  }

  @Get()
  async findAll(@Query() query: QueryTestimonialDto) {
    return this.service.findAll(query);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTestimonialDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Delete()
  async removeMany(@Body() dto: BulkDeleteTestimonialsDto) {
    return this.service.removeMany(dto.ids);
  }
}
