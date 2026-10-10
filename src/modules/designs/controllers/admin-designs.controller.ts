import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { Permission } from 'src/common/decorators/permission.decorator';
import { perm } from 'src/common/constants/permissions.constant';
import { DesignsService } from '../services/designs.service';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('admin/designs')
export class AdminDesignsController {
  constructor(private readonly designsService: DesignsService) {}

  /**
   * 7. Admin: List all designs including unpublished (newest first).
   */
  @Get()
  @Permission(perm('designs', 'READ'))
  async findAll() {
    const data = await this.designsService.findAllAdmin();
    return {
      success: true,
      data,
    };
  }
}
