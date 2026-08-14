import { Injectable, NotFoundException } from '@nestjs/common';
import { ExpensesRepository } from '../repositories/expenses.repository';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import { QueryExpensesDto } from '../dto/query-expenses.dto';
import { Prisma } from 'generated/src/prisma/client';
import { UserActivityService } from 'src/modules/user-activity/user-activity.service';

@Injectable()
export class ExpensesService {
  constructor(
    private readonly repository: ExpensesRepository,
    private readonly activityService: UserActivityService,
  ) {}

  async create(dto: CreateExpenseDto, userId: string) {
    const { expenseDate, attachment, ...rest } = dto;
    const expense = await this.repository.create({
      ...rest,
      expenseDate: new Date(expenseDate),
      attachment: attachment ? (attachment as unknown as Prisma.InputJsonValue) : undefined,
      createdBy: userId ? { connect: { id: userId } } : undefined,
    });

    this.activityService.log('CREATE', 'expenses', userId, {
      id: expense.id,
      name: expense.description,
    });

    return expense;
  }

  async findAll(query: QueryExpensesDto) {
    const {
      page,
      limit,
      search,
      status,
      category,
      paidBy,
      paymentMethod,
      from,
      to,
      sortBy,
      sortDir,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.ExpenseWhereInput = {};

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { vendor: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (paidBy) {
      where.paidBy = { equals: paidBy, mode: 'insensitive' };
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (from || to) {
      where.expenseDate = {};
      if (from) {
        where.expenseDate.gte = new Date(from);
      }
      if (to) {
        where.expenseDate.lte = new Date(to);
      }
    }

    const orderBy: Prisma.ExpenseOrderByWithRelationInput = {};
    if (sortBy) {
      orderBy[sortBy] = sortDir || 'desc';
    } else {
      orderBy.expenseDate = 'desc';
    }

    const [data, total] = await Promise.all([
      this.repository.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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
    const expense = await this.repository.findById(id);
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }
    return expense;
  }

  async update(id: string, dto: UpdateExpenseDto, userId?: string) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('Expense not found');
    }

    const { expenseDate, attachment, ...rest } = dto as any;
    
    const updateData: Prisma.ExpenseUpdateInput = {
      ...rest,
    };

    if (expenseDate) {
      updateData.expenseDate = new Date(expenseDate);
    }

    if (attachment) {
      updateData.attachment = attachment as unknown as Prisma.InputJsonValue;
    }

    const updated = await this.repository.update(id, updateData);

    this.activityService.log('UPDATE', 'expenses', userId, {
      id: updated.id,
      name: updated.description,
    });

    return updated;
  }

  async remove(id: string, userId?: string) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('Expense not found');
    }

    this.activityService.log('DELETE', 'expenses', userId, {
      id: existing.id,
      name: existing.description,
    });

    return this.repository.delete(id);
  }
}
