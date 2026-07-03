import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/src/prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class LeadsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.LeadCreateInput) {
    return this.prisma.lead.create({ data });
  }

  async findMany(params: Prisma.LeadFindManyArgs) {
    return this.prisma.lead.findMany(params);
  }

  async count(where?: Prisma.LeadWhereInput) {
    return this.prisma.lead.count({ where });
  }

  async findById(id: string) {
    return this.prisma.lead.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.LeadUpdateInput) {
    return this.prisma.lead.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.lead.delete({
      where: { id },
    });
  }

  async deleteMany(ids: string[]) {
    return this.prisma.lead.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
