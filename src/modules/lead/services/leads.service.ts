import { Injectable, NotFoundException } from '@nestjs/common';
import { LeadsRepository } from '../repositories/leads.repository';
import { CreateLeadDto } from '../dto/create-lead.dto';
import { UpdateLeadDto } from '../dto/update-lead.dto';
import { QueryLeadsDto } from '../dto/query-leads.dto';
import { Prisma } from 'generated/src/prisma/client';

@Injectable()
export class LeadsService {
  constructor(private readonly repository: LeadsRepository) {}

  async create(dto: CreateLeadDto, userId: string) {
    return this.repository.create({
      ...dto,
      addedBy: userId ? { connect: { id: userId } } : undefined,
    });
  }

  async findAll(query: QueryLeadsDto) {
    const { page, limit, search, status } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.LeadWhereInput = {};

    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.repository.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
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

  async findOne(id: string) {
    const lead = await this.repository.findById(id);

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return lead;
  }

  async update(id: string, dto: UpdateLeadDto) {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Lead not found');
    }

    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Lead not found');
    }

    return this.repository.delete(id);
  }

  async removeMany(ids: string[]) {
    return this.repository.deleteMany(ids);
  }
}
