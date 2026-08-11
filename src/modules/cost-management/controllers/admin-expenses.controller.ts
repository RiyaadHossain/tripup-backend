import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { Permission } from 'src/common/decorators/permission.decorator';
import { perm } from 'src/common/constants/permissions.constant';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

import { ExpensesService } from '../services/expenses.service';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import { QueryExpensesDto } from '../dto/query-expenses.dto';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('admin/expenses')
export class AdminExpensesController {
  constructor(private readonly service: ExpensesService) {}

  @Post()
  @Permission(perm('expenses', 'CREATE'))
  async create(
    @Body() dto: CreateExpenseDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.create(dto, userId);
  }

  @Get()
  @Permission(perm('expenses', 'READ'))
  async findAll(@Query() query: QueryExpensesDto) {
    const result = await this.service.findAll(query);
    return {
      data: {
        data: result.data,
        meta: result.meta,
      },
    };
  }

  @Patch(':id')
  @Permission(perm('expenses', 'UPDATE'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permission(perm('expenses', 'DELETE'))
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
