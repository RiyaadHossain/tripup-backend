import { Injectable, NotFoundException } from '@nestjs/common';

import { TestimonialsRepository } from '../repositories/testimonials.repository';

import { CreateTestimonialDto } from '../dto/create-testimonial.dto';
import { UpdateTestimonialDto } from '../dto/update-testimonial.dto';
import { QueryTestimonialDto } from '../dto/query-testimonial.dto';
import { UserActivityService } from 'src/modules/user-activity/user-activity.service';

@Injectable()
export class TestimonialsService {
  constructor(
    private readonly repository: TestimonialsRepository,
    private readonly activityService: UserActivityService,
  ) {}

  async create(dto: CreateTestimonialDto, userId: string) {
    const testimonial = await this.repository.create({ ...dto, addedBy: userId ? { connect: { id: userId } } : undefined });

    this.activityService.log('CREATE', 'testimonials', userId, {
      id: testimonial.id,
      name: testimonial.userName,
    });

    return testimonial;
  }

  async findAll(query: QueryTestimonialDto) {
    const { page, limit, search, isPublished } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        {
          userName: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          company: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          testimony: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (isPublished !== undefined) {
      where.isPublished = isPublished === 'true';
    }

    const [data, total] = await Promise.all([
      this.repository.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          displayOrder: 'asc',
        },
      }),

      this.repository.count(where),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, dto: UpdateTestimonialDto, userId?: string) {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Testimonial not found');
    }

    const updated = await this.repository.update(id, dto);

    this.activityService.log('UPDATE', 'testimonials', userId, {
      id: updated.id,
      name: updated.userName,
    });

    return updated;
  }

  async remove(id: string, userId?: string) {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Testimonial not found');
    }

    this.activityService.log('DELETE', 'testimonials', userId, {
      id: existing.id,
      name: existing.userName,
    });

    return this.repository.delete(id);
  }

  async removeMany(ids: string[], userId?: string) {
    this.activityService.log('DELETE', 'testimonials', userId, null);
    return this.repository.deleteMany(ids);
  }
}
