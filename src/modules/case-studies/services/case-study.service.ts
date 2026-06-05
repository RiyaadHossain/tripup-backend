import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'generated/src/prisma/client';

import { CaseStudyRepository } from '../repositories/case-study.repository';

import { CreateCaseStudyDto } from '../dto/create-case-study.dto';
import { UpdateCaseStudyDto } from '../dto/update-case-study.dto';
import { QueryCaseStudiesDto } from '../dto/query-case-studies.dto';

@Injectable()
export class CaseStudyService {
  constructor(private readonly repository: CaseStudyRepository) {}

  async create(dto: CreateCaseStudyDto) {
    const { category, ...rest } = dto;

    if (rest.isFeatured) {
      await this.repository.clearFeatured();
    }

    return this.repository.create({
      ...rest,
      metrics: rest.metrics as unknown as Prisma.InputJsonValue,
      snapshot: rest.snapshot as unknown as Prisma.InputJsonValue,
      challenge: rest.challenge as unknown as Prisma.InputJsonValue,
      approachSteps: rest.approachSteps as unknown as Prisma.InputJsonValue,
      transformation: rest.transformation as unknown as Prisma.InputJsonValue,
      results: rest.results as unknown as Prisma.InputJsonValue,
      testimonial: rest.testimonial as unknown as Prisma.InputJsonValue,
      category: category
        ? {
            connect: { id: category },
          }
        : undefined,
    });
  }

  async findAll(query: QueryCaseStudiesDto) {
    const { page, limit, search, isPublished, categoryId } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          slug: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          excerpt: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          industryTag: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
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
          createdAt: 'desc',
        },
        include: {
          category: true,
        },
      }),

      this.repository.count(where),
    ]);

    const formattedData = data.map((item: any) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      date: item.date,
      readingTime: item.readingTime,
      ctaLabel: item.ctaLabel,
      industryTag: item.industryTag,
      coverImage: item.coverImage,
      createdAt: item.createdAt,
      isPublished: item.isPublished,
      isFeatured: item.isFeatured,
      category: item.category
        ? { id: item.category.id, name: item.category.name }
        : null,
    }));

    return {
      data: formattedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOnePublic(id: string) {
    const caseStudy = await this.repository.findById(id);

    if (!caseStudy || !caseStudy.isPublished) {
      throw new NotFoundException('Case study not found');
    }

    return caseStudy;
  }

  async update(id: string, dto: UpdateCaseStudyDto) {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Case study not found');
    }

    const { category, ...rest } = dto;

    if (rest.isFeatured) {
      await this.repository.clearFeatured(id);
    }

    return this.repository.update(id, {
      ...rest,
      metrics: rest.metrics ? (rest.metrics as unknown as Prisma.InputJsonValue) : undefined,
      snapshot: rest.snapshot ? (rest.snapshot as unknown as Prisma.InputJsonValue) : undefined,
      challenge: rest.challenge ? (rest.challenge as unknown as Prisma.InputJsonValue) : undefined,
      approachSteps: rest.approachSteps ? (rest.approachSteps as unknown as Prisma.InputJsonValue) : undefined,
      transformation: rest.transformation ? (rest.transformation as unknown as Prisma.InputJsonValue) : undefined,
      results: rest.results ? (rest.results as unknown as Prisma.InputJsonValue) : undefined,
      testimonial: rest.testimonial ? (rest.testimonial as unknown as Prisma.InputJsonValue) : undefined,
      category:
        category !== undefined
          ? category
            ? {
                connect: { id: category },
              }
            : {
                disconnect: true,
              }
          : undefined,
    });
  }

  async remove(id: string) {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Case study not found');
    }

    return this.repository.delete(id);
  }

  async removeMany(ids: string[]) {
    return this.repository.deleteMany(ids);
  }
}
