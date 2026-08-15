import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { Permission } from 'src/common/decorators/permission.decorator';
import { perm } from 'src/common/constants/permissions.constant';

import { TestimonialsService } from '../services/testimonials.service';

import { CreateTestimonialDto } from '../dto/create-testimonial.dto';
import { UpdateTestimonialDto } from '../dto/update-testimonial.dto';
import { QueryTestimonialDto } from '../dto/query-testimonial.dto';
import { BulkDeleteTestimonialsDto } from '../dto/bulk-delete-testimonials.dto';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('admin/testimonials')
export class AdminTestimonialsController {
  constructor(private readonly service: TestimonialsService) {}

  @Post()
  @Permission(perm('testimonials', 'CREATE'))
  async create(@Body() dto: CreateTestimonialDto, @CurrentUser('sub') userId: string) {
    return this.service.create(dto, userId);
  }

  @Get()
  @Permission(perm('testimonials', 'READ'))
  async findAll(@Query() query: QueryTestimonialDto) {
    return this.service.findAll(query);
  }

  @Patch(':id')
  @Permission(perm('testimonials', 'UPDATE'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTestimonialDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.update(id, dto, userId);
  }

  @Delete(':id')
  @Permission(perm('testimonials', 'DELETE'))
  async remove(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.remove(id, userId);
  }

  @Delete()
  @Permission(perm('testimonials', 'DELETE'))
  async removeMany(
    @Body() dto: BulkDeleteTestimonialsDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.removeMany(dto.ids, userId);
  }
}
