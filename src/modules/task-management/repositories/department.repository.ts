import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/src/prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class DepartmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.DepartmentCreateInput) {
    return this.prisma.department.create({ data });
  }

  async findMany() {
    return this.prisma.department.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { tasks: true } },
      },
    });
  }

  async findListing() {
    return this.prisma.department.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
  }

  async findById(id: string) {
    return this.prisma.department.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.DepartmentUpdateInput) {
    return this.prisma.department.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.department.delete({ where: { id } });
  }
}
