import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/src/prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class CaseStudyCategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.CaseStudyCategoryCreateInput) {
    return await this.prisma.caseStudyCategory.create({
      data,
    });
  }

  async findMany() {
    return await this.prisma.caseStudyCategory.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            caseStudies: true,
          },
        },
      },
    });
  }

  async findListing() {
    return await this.prisma.caseStudyCategory.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
      },
    });
  }

  async findById(id: string) {
    return await this.prisma.caseStudyCategory.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.CaseStudyCategoryUpdateInput) {
    return await this.prisma.caseStudyCategory.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return await this.prisma.caseStudyCategory.delete({
      where: { id },
    });
  }
}
