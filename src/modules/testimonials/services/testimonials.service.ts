import { Injectable, NotFoundException } from '@nestjs/common';

import { TestimonialsRepository } from '../repositories/testimonials.repository';

import { CreateTestimonialDto } from '../dto/create-testimonial.dto';
import { UpdateTestimonialDto } from '../dto/update-testimonial.dto';
import { QueryTestimonialDto } from '../dto/query-testimonial.dto';

@Injectable()
export class TestimonialsService {
  constructor(private readonly repository: TestimonialsRepository) {}

  async create(dto: CreateTestimonialDto, userId: string) {
    return this.repository.create({ ...dto, addedBy: userId ? { connect: { id: userId } } : undefined, });
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

  async update(id: string, dto: UpdateTestimonialDto) {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Testimonial not found');
    }

    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Testimonial not found');
    }

    return this.repository.delete(id);
  }

  async removeMany(ids: string[]) {
    return this.repository.deleteMany(ids);
  }
}
