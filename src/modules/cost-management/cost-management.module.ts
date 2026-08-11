import { Module } from '@nestjs/common';
import { ExpensesService } from './services/expenses.service';
import { AdminExpensesController } from './controllers/admin-expenses.controller';
import { ExpensesRepository } from './repositories/expenses.repository';

@Module({
  controllers: [AdminExpensesController],
  providers: [ExpensesService, ExpensesRepository],
  exports: [ExpensesService],
})
export class CostManagementModule {}
