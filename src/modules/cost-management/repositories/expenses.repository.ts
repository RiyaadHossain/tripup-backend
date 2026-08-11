import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/src/prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class ExpensesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ExpenseCreateInput) {
    return this.prisma.expense.create({ data });
  }

  async findMany(params: Prisma.ExpenseFindManyArgs) {
    return this.prisma.expense.findMany(params);
  }

  async count(where?: Prisma.ExpenseWhereInput) {
    return this.prisma.expense.count({ where });
  }

  async findById(id: string) {
    return this.prisma.expense.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.ExpenseUpdateInput) {
    return this.prisma.expense.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.expense.delete({
      where: { id },
    });
  }
}
