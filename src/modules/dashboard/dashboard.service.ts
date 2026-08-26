import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import {
  LeadStatus,
  LeadSource,
  TaskStatus,
  TaskPriority,
  ExpenseStatus,
} from 'generated/src/prisma/client';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { TrendPeriod, TrendQueryDto } from './dto/trend-query.dto';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** All enum values for zero-filling */
const ALL_LEAD_STATUSES = Object.values(LeadStatus);
const ALL_LEAD_SOURCES = Object.values(LeadSource);
const ALL_TASK_STATUSES = Object.values(TaskStatus);
const ALL_TASK_PRIORITIES = Object.values(TaskPriority);

function safeRate(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return parseFloat(((numerator / denominator) * 100).toFixed(2));
}

/** Maps a TrendPeriod to the date range and the PostgreSQL DATE_TRUNC unit */
function resolveTrendConfig(period: TrendPeriod): {
  from: Date;
  trunc: string;
} {
  const now = new Date();
  switch (period) {
    case '7d':
      return { from: new Date(Date.now() - 7 * 86_400_000), trunc: 'day' };
    case '30d':
      return { from: new Date(Date.now() - 30 * 86_400_000), trunc: 'day' };
    case '90d':
      return { from: new Date(Date.now() - 90 * 86_400_000), trunc: 'week' };
    case '6m': {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 6);
      return { from: d, trunc: 'month' };
    }
    case '1y': {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() - 1);
      return { from: d, trunc: 'month' };
    }
  }
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /** Master overview — all sections in one response */
  async getOverview(query: DashboardQueryDto) {
    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(query.to) : undefined;

    // Only include defined bounds so Prisma's DateTimeFilter is satisfied
    const dateFilter: { gte?: Date; lte?: Date } | undefined =
      from || to
        ? {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          }
        : undefined;

    // Run independent top-level sections in parallel
    const [
      leadStats,
      leadStatusDist,
      leadSourceDist,
      conversionBySource,
      financials,
      taskStats,
      contentStats,
      teamStats,
      recentActivity,
    ] = await Promise.all([
      this.getLeadStats(dateFilter),
      this.getLeadStatusDistribution(dateFilter),
      this.getLeadSourceDistribution(dateFilter),
      this.getLeadConversionBySource(dateFilter),
      this.getFinancialStats(dateFilter),
      this.getTaskStats(),
      this.getContentStats(dateFilter),
      this.getTeamStats(),
      this.getRecentActivity(10, dateFilter),
    ]);

    return {
      overview: {
        totalLeads: leadStats.total,
        newLeads: leadStats.new,
        potentialLeads: leadStats.potential,
        respondedLeads: leadStats.responded,
        convertedLeads: leadStats.converted,
        conversionRate: leadStats.conversionRate,
      },
      leads: {
        statusDistribution: leadStatusDist,
        sourceDistribution: leadSourceDist,
        conversionBySource,
      },
      financials,
      tasks: taskStats,
      content: contentStats,
      team: teamStats,
      recentActivity,
    };
  }

  /** Lead acquisition trend over time */
  async getLeadTrend(query: TrendQueryDto) {
    const { period } = query;
    const { from, trunc } = resolveTrendConfig(period);

    const rows = await this.prisma.$queryRaw<{ date: Date; count: bigint }[]>`
      SELECT
        DATE_TRUNC(${trunc}, "createdAt") AS date,
        COUNT(*) AS count
      FROM "Lead"
      WHERE "createdAt" >= ${from}
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    return {
      period,
      data: rows.map((r) => ({
        date: r.date.toISOString().slice(0, 10),
        count: Number(r.count),
      })),
    };
  }

  /** Expense trend over time */
  async getFinancialTrend(query: TrendQueryDto) {
    const { period } = query;
    const { from, trunc } = resolveTrendConfig(period);

    const rows = await this.prisma.$queryRaw<{ date: Date; amount: string }[]>`
      SELECT
        DATE_TRUNC(${trunc}, "expenseDate") AS date,
        SUM(amount)::text AS amount
      FROM "expenses"
      WHERE "expenseDate" >= ${from}
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    return {
      period,
      data: rows.map((r) => ({
        date: r.date.toISOString().slice(0, 10),
        amount: parseFloat(r.amount ?? '0'),
      })),
    };
  }

  // ---------------------------------------------------------------------------
  // Lead Stats
  // ---------------------------------------------------------------------------

  private async getLeadStats(
    dateFilter?: { gte?: Date; lte?: Date },
  ) {
    const baseWhere = dateFilter ? { createdAt: dateFilter } : {};

    const [total, potential, statusGroups] = await Promise.all([
      this.prisma.lead.count({ where: baseWhere }),
      this.prisma.lead.count({ where: { ...baseWhere, isPotential: true } }),
      this.prisma.lead.groupBy({
        by: ['status'],
        where: baseWhere,
        _count: { _all: true },
      }),
    ]);

    const statusMap = Object.fromEntries(
      statusGroups.map((g) => [g.status, g._count._all]),
    );

    const newCount = statusMap[LeadStatus.NEW] ?? 0;
    const responded = statusMap[LeadStatus.RESPOND] ?? 0;
    const converted = statusMap[LeadStatus.CONVERT] ?? 0;

    return {
      total,
      new: newCount,
      potential,
      responded,
      converted,
      conversionRate: safeRate(converted, total),
    };
  }

  private async getLeadStatusDistribution(
    dateFilter?: { gte?: Date; lte?: Date },
  ) {
    const baseWhere = dateFilter ? { createdAt: dateFilter } : {};

    const groups = await this.prisma.lead.groupBy({
      by: ['status'],
      where: baseWhere,
      _count: { _all: true },
    });

    const map = Object.fromEntries(
      groups.map((g) => [g.status, g._count._all]),
    );

    // Ensure all statuses present, including zeros
    return ALL_LEAD_STATUSES.map((status) => ({
      status,
      count: map[status] ?? 0,
    }));
  }

  private async getLeadSourceDistribution(
    dateFilter?: { gte?: Date; lte?: Date },
  ) {
    const baseWhere = dateFilter ? { createdAt: dateFilter } : {};

    const [groups, unknownCount] = await Promise.all([
      this.prisma.lead.groupBy({
        by: ['source'],
        where: { ...baseWhere, source: { not: null } },
        _count: { _all: true },
      }),
      this.prisma.lead.count({ where: { ...baseWhere, source: null } }),
    ]);

    const map = Object.fromEntries(
      groups.map((g) => [g.source as string, g._count._all]),
    );

    const known = ALL_LEAD_SOURCES.map((source) => ({
      source,
      count: map[source] ?? 0,
    }));

    return [
      ...known,
      { source: 'UNKNOWN', count: unknownCount },
    ];
  }

  private async getLeadConversionBySource(
    dateFilter?: { gte?: Date; lte?: Date },
  ) {
    const baseWhere = dateFilter ? { createdAt: dateFilter } : {};

    const [totalBySource, convertedBySource, totalUnknown, convertedUnknown] =
      await Promise.all([
        this.prisma.lead.groupBy({
          by: ['source'],
          where: { ...baseWhere, source: { not: null } },
          _count: { _all: true },
        }),
        this.prisma.lead.groupBy({
          by: ['source'],
          where: {
            ...baseWhere,
            source: { not: null },
            status: LeadStatus.CONVERT,
          },
          _count: { _all: true },
        }),
        this.prisma.lead.count({ where: { ...baseWhere, source: null } }),
        this.prisma.lead.count({
          where: { ...baseWhere, source: null, status: LeadStatus.CONVERT },
        }),
      ]);

    const totalMap = Object.fromEntries(
      totalBySource.map((g) => [g.source as string, g._count._all]),
    );
    const convertedMap = Object.fromEntries(
      convertedBySource.map((g) => [g.source as string, g._count._all]),
    );

    const known = ALL_LEAD_SOURCES.map((source) => {
      const total = totalMap[source] ?? 0;
      const converted = convertedMap[source] ?? 0;
      return {
        source,
        totalLeads: total,
        convertedLeads: converted,
        conversionRate: safeRate(converted, total),
      };
    });

    return [
      ...known,
      {
        source: 'UNKNOWN',
        totalLeads: totalUnknown,
        convertedLeads: convertedUnknown,
        conversionRate: safeRate(convertedUnknown, totalUnknown),
      },
    ];
  }

  // ---------------------------------------------------------------------------
  // Financial Stats
  // ---------------------------------------------------------------------------

  private async getFinancialStats(
    dateFilter?: { gte?: Date; lte?: Date },
  ) {
    const baseWhere = dateFilter ? { expenseDate: dateFilter } : {};

    const [statusGroups, categoryGroups] = await Promise.all([
      this.prisma.expense.groupBy({
        by: ['status'],
        where: baseWhere,
        _sum: { amount: true },
        _count: { _all: true },
      }),
      this.prisma.expense.groupBy({
        by: ['category'],
        where: baseWhere,
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
      }),
    ]);

    const statusMap = Object.fromEntries(
      statusGroups.map((g) => [
        g.status,
        parseFloat((g._sum.amount ?? 0).toString()),
      ]),
    );

    const totalExpenses =
      Object.values(statusMap).reduce((a, b) => a + b, 0);

    return {
      totalExpenses,
      paidExpenses: statusMap[ExpenseStatus.PAID] ?? 0,
      pendingExpenses: statusMap[ExpenseStatus.PENDING] ?? 0,
      dueExpenses: statusMap[ExpenseStatus.DUE] ?? 0,
      byCategory: categoryGroups.map((g) => ({
        category: g.category,
        amount: parseFloat((g._sum.amount ?? 0).toString()),
      })),
    };
  }

  // ---------------------------------------------------------------------------
  // Task Stats
  // ---------------------------------------------------------------------------

  private async getTaskStats() {
    const now = new Date();

    const [statusGroups, priorityGroups, overdueCount, upcomingTasks, overdueTasks] =
      await Promise.all([
        this.prisma.task.groupBy({
          by: ['status'],
          _count: { _all: true },
        }),
        this.prisma.task.groupBy({
          by: ['priority'],
          _count: { _all: true },
        }),
        this.prisma.task.count({
          where: {
            deadline: { lt: now },
            status: { not: TaskStatus.DONE },
          },
        }),
        // Upcoming — next 8 tasks by deadline (not done, deadline in future)
        this.prisma.task.findMany({
          where: {
            deadline: { gte: now },
            status: { not: TaskStatus.DONE },
          },
          orderBy: { deadline: 'asc' },
          take: 8,
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            deadline: true,
            milestone: { select: { id: true, name: true } },
            department: { select: { id: true, name: true } },
            assignees: {
              include: {
                user: { select: { id: true, name: true } },
              },
            },
          },
        }),
        // Overdue — most critical first
        this.prisma.task.findMany({
          where: {
            deadline: { lt: now },
            status: { not: TaskStatus.DONE },
          },
          orderBy: [{ priority: 'desc' }, { deadline: 'asc' }],
          take: 8,
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            deadline: true,
            milestone: { select: { id: true, name: true } },
            department: { select: { id: true, name: true } },
            assignees: {
              include: {
                user: { select: { id: true, name: true } },
              },
            },
          },
        }),
      ]);

    const statusMap = Object.fromEntries(
      statusGroups.map((g) => [g.status, g._count._all]),
    );
    const priorityMap = Object.fromEntries(
      priorityGroups.map((g) => [g.priority, g._count._all]),
    );

    const total = Object.values(statusMap).reduce((a, b) => a + b, 0);

    const statusDistribution = ALL_TASK_STATUSES.map((status) => ({
      status,
      count: statusMap[status] ?? 0,
    }));

    const priorityDistribution = ALL_TASK_PRIORITIES.map((priority) => ({
      priority,
      count: priorityMap[priority] ?? 0,
    }));

    return {
      total,
      todo: statusMap[TaskStatus.TO_DO] ?? 0,
      inProgress: statusMap[TaskStatus.IN_PROGRESS] ?? 0,
      inReview: statusMap[TaskStatus.IN_REVIEW] ?? 0,
      done: statusMap[TaskStatus.DONE] ?? 0,
      overdue: overdueCount,
      statusDistribution,
      priorityDistribution,
      upcomingTasks: upcomingTasks.map((t) => ({
        ...t,
        assignees: t.assignees.map((a) => a.user),
      })),
      overdueTasks: overdueTasks.map((t) => ({
        ...t,
        assignees: t.assignees.map((a) => a.user),
      })),
    };
  }

  // ---------------------------------------------------------------------------
  // Content Stats
  // ---------------------------------------------------------------------------

  private async getContentStats(
    dateFilter?: { gte?: Date; lte?: Date },
  ) {
    const recentWhere = dateFilter ? { updatedAt: dateFilter } : {};

    const [
      insightTotal,
      insightPublished,
      insightFeatured,
      serviceTotal,
      servicePublished,
      serviceComingSoon,
      caseTotal,
      casePublished,
      caseFeatured,
      playbookTotal,
      playbookPublished,
      playbookFeatured,
      recentInsights,
      recentCaseStudies,
      recentPlaybooks,
      recentServices,
    ] = await Promise.all([
      this.prisma.travelInsight.count(),
      this.prisma.travelInsight.count({ where: { isPublished: true } }),
      this.prisma.travelInsight.count({ where: { isFeatured: true } }),
      this.prisma.travelService.count(),
      this.prisma.travelService.count({ where: { isPublished: true } }),
      this.prisma.travelService.count({ where: { comingSoon: true } }),
      this.prisma.caseStudy.count(),
      this.prisma.caseStudy.count({ where: { isPublished: true } }),
      this.prisma.caseStudy.count({ where: { isFeatured: true } }),
      this.prisma.playbook.count(),
      this.prisma.playbook.count({ where: { isPublished: true } }),
      this.prisma.playbook.count({ where: { isFeatured: true } }),
      // Recent content — latest 4 from each type
      this.prisma.travelInsight.findMany({
        where: recentWhere,
        orderBy: { updatedAt: 'desc' },
        take: 4,
        select: { id: true, title: true, updatedAt: true, isPublished: true },
      }),
      this.prisma.caseStudy.findMany({
        where: recentWhere,
        orderBy: { updatedAt: 'desc' },
        take: 4,
        select: { id: true, title: true, updatedAt: true, isPublished: true },
      }),
      this.prisma.playbook.findMany({
        where: recentWhere,
        orderBy: { updatedAt: 'desc' },
        take: 4,
        select: { id: true, title: true, updatedAt: true, isPublished: true },
      }),
      this.prisma.travelService.findMany({
        where: recentWhere,
        orderBy: { updatedAt: 'desc' },
        take: 4,
        select: { id: true, title: true, updatedAt: true, isPublished: true },
      }),
    ]);

    // Merge & normalise recent content, sort by updatedAt desc, take top 10
    const recentContent = [
      ...recentInsights.map((i) => ({
        type: 'TRAVEL_INSIGHT' as const,
        id: i.id,
        title: i.title,
        action: 'UPDATED' as const,
        isPublished: i.isPublished,
        updatedAt: i.updatedAt,
      })),
      ...recentCaseStudies.map((c) => ({
        type: 'CASE_STUDY' as const,
        id: c.id,
        title: c.title,
        action: 'UPDATED' as const,
        isPublished: c.isPublished,
        updatedAt: c.updatedAt,
      })),
      ...recentPlaybooks.map((p) => ({
        type: 'PLAYBOOK' as const,
        id: p.id,
        title: p.title,
        action: 'UPDATED' as const,
        isPublished: p.isPublished,
        updatedAt: p.updatedAt,
      })),
      ...recentServices.map((s) => ({
        type: 'SERVICE' as const,
        id: s.id,
        title: s.title,
        action: 'UPDATED' as const,
        isPublished: s.isPublished,
        updatedAt: s.updatedAt,
      })),
    ]
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 10);

    return {
      travelInsights: {
        total: insightTotal,
        published: insightPublished,
        drafts: insightTotal - insightPublished,
        featured: insightFeatured,
      },
      services: {
        total: serviceTotal,
        published: servicePublished,
        comingSoon: serviceComingSoon,
      },
      caseStudies: {
        total: caseTotal,
        published: casePublished,
        drafts: caseTotal - casePublished,
        featured: caseFeatured,
      },
      playbooks: {
        total: playbookTotal,
        published: playbookPublished,
        drafts: playbookTotal - playbookPublished,
        featured: playbookFeatured,
      },
      recentContent,
    };
  }

  // ---------------------------------------------------------------------------
  // Team Stats
  // ---------------------------------------------------------------------------

  private async getTeamStats() {
    const [
      totalUsers,
      totalTeamMembers,
      usersWithRoles,
      roleGroups,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.teamMember.count(),
      this.prisma.user.count({ where: { roleId: { not: null } } }),
      this.prisma.user.groupBy({
        by: ['roleId'],
        where: { roleId: { not: null } },
        _count: { _all: true },
      }),
    ]);

    // Resolve role names for the groupBy result
    const roleIds = roleGroups.map((g) => g.roleId as string);
    const roles = roleIds.length
      ? await this.prisma.role.findMany({
          where: { id: { in: roleIds } },
          select: { id: true, name: true },
        })
      : [];

    const roleNameMap = Object.fromEntries(roles.map((r) => [r.id, r.name]));

    const byRole = roleGroups.map((g) => ({
      role: roleNameMap[g.roleId as string] ?? g.roleId,
      count: g._count._all,
    }));

    return {
      totalUsers,
      totalTeamMembers,
      usersWithRoles,
      usersWithoutRoles: totalUsers - usersWithRoles,
      byRole,
    };
  }

  // ---------------------------------------------------------------------------
  // Recent Activity
  // ---------------------------------------------------------------------------

  private async getRecentActivity(
    limit = 10,
    dateFilter?: { gte?: Date; lte?: Date },
  ) {
    const where = dateFilter ? { createdAt: dateFilter } : {};

    const activities = await this.prisma.userActivity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        action: true,
        module: true,
        objectId: true,
        objectMeta: true,
        userId: true,
        createdAt: true,
        user: {
          select: { id: true, name: true },
        },
      },
    });

    return activities;
  }
}
