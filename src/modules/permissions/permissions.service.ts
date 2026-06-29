import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns all permissions grouped by module.
   *
   * Used by the frontend permission matrix UI to build a table where rows
   * are modules and columns are actions.
   *
   * Example response:
   * [
   *   {
   *     module: "services",
   *     permissions: [
   *       { id: "...", action: "READ" },
   *       { id: "...", action: "CREATE" },
   *       ...
   *     ]
   *   }
   * ]
   */
  async findAllGrouped() {
    const permissions = await this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
      select: {
        id: true,
        module: true,
        action: true,
      },
    });

    // Group by module
    const grouped = new Map<
      string,
      { id: string; action: string }[]
    >();

    for (const p of permissions) {
      if (!grouped.has(p.module)) {
        grouped.set(p.module, []);
      }
      grouped.get(p.module)!.push({ id: p.id, action: p.action });
    }

    return Array.from(grouped.entries()).map(([module, perms]) => ({
      module,
      permissions: perms,
    }));
  }

  /** Returns the full (flat) permission list — useful for admin dropdowns. */
  async findAll() {
    return this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    });
  }
}
