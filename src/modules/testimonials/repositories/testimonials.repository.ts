import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/src/prisma/browser';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class TestimonialsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.TestimonialCreateInput) {
    return this.prisma.testimonial.create({ data });
  }

  async findMany(params: Prisma.TestimonialFindManyArgs) {
    return this.prisma.testimonial.findMany(params);
  }

  async count(where?: Prisma.TestimonialWhereInput) {
    return this.prisma.testimonial.count({ where });
  }

  async findById(id: string) {
    return this.prisma.testimonial.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.TestimonialUpdateInput) {
    return this.prisma.testimonial.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.testimonial.delete({
      where: { id },
    });
  }

  async deleteMany(ids: string[]) {
    return this.prisma.testimonial.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
