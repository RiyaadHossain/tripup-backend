import { Module } from '@nestjs/common';
import { UserActivityModule } from 'src/modules/user-activity/user-activity.module';

// Controllers
import { AdminTasksController } from './controllers/admin-tasks.controller';
import { AdminMilestonesController } from './controllers/admin-milestones.controller';
import { AdminDepartmentsController } from './controllers/admin-departments.controller';

// Services
import { TasksService } from './services/tasks.service';
import { MilestonesService } from './services/milestones.service';
import { DepartmentsService } from './services/departments.service';

// Repositories
import { TaskRepository } from './repositories/task.repository';
import { MilestoneRepository } from './repositories/milestone.repository';
import { DepartmentRepository } from './repositories/department.repository';

@Module({
  imports: [UserActivityModule],
  controllers: [
    AdminTasksController,
    AdminMilestonesController,
    AdminDepartmentsController,
  ],
  providers: [
    TasksService,
    MilestonesService,
    DepartmentsService,
    TaskRepository,
    MilestoneRepository,
    DepartmentRepository,
  ],
})
export class TaskManagementModule {}
