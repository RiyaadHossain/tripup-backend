import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import {
  Cadence,
  ChallengeParameter,
  ChallengeType,
  MilestoneMetric,
  TargetMetric,
} from '../enums/competition.enums';
import {
  Achievement,
  Badge,
  Challenge,
  ChallengeTarget,
  Employee,
  Milestone,
  MonthlyWinners,
  PerformanceRecord,
  ScoringRules,
  Team,
  WinnerSnapshot,
} from '../interfaces/competition.interfaces';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { CreateTeamDto } from '../dto/create-team.dto';
import { PatchTeamDto } from '../dto/patch-team.dto';
import { ScoringRulesDto } from '../dto/scoring-rules.dto';
import { CreateChallengeDto } from '../dto/create-challenge.dto';
import { PatchChallengeDto } from '../dto/patch-challenge.dto';
import { ArchiveChallengeDto } from '../dto/archive-challenge.dto';
import { UpsertPerformanceDto } from '../dto/upsert-performance.dto';
import { CreateBadgeDto } from '../dto/create-badge.dto';
import { PatchBadgeDto } from '../dto/patch-badge.dto';
import { CreateAchievementDto } from '../dto/create-achievement.dto';
import { CreateMilestoneDto } from '../dto/create-milestone.dto';
import { PatchMilestoneDto } from '../dto/patch-milestone.dto';
import { NotificationsService } from 'src/modules/notifications/notifications.service';

const DEFAULT_SCORING_RULES: ScoringRules = {
  lead: 10,
  conversion: 50,
  consistency: 20,
  contribution: 20,
  target: 100,
  win: 200,
};

@Injectable()
export class CompetitionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ---------------------------------------------------------------------------
  // Helper: Get Current Month String (YYYY-MM)
  // ---------------------------------------------------------------------------
  private getCurrentMonth(): string {
    return new Date().toISOString().slice(0, 7);
  }

  // ---------------------------------------------------------------------------
  // Employees Helper
  // ---------------------------------------------------------------------------
  async getEmployees(): Promise<Employee[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        profileImgUrl: true,
        role: { select: { name: true } },
      },
    });

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      role: u.role?.name ?? 'Member',
      avatar: u.profileImgUrl ?? null,
    }));
  }

  // ---------------------------------------------------------------------------
  // Overview (Bootstrap)
  // ---------------------------------------------------------------------------
  async getOverview(month?: string) {
    const selectedMonth = month || this.getCurrentMonth();

    const [
      teams,
      employees,
      records,
      challenges,
      achievements,
      rules,
      categories,
      badges,
      milestones,
      winningHistory,
    ] = await Promise.all([
      this.getTeams(),
      this.getEmployees(),
      this.getPerformance({ month: month ? selectedMonth : undefined }),
      this.getChallenges(),
      this.getAchievements(),
      this.getScoringRules(),
      this.getCategories(),
      this.getBadges(),
      this.getMilestones(),
      this.getWinners(),
    ]);

    return {
      teams,
      employees,
      records,
      challenges,
      achievements,
      rules,
      categories,
      badges,
      milestones,
      winningHistory,
    };
  }

  // ---------------------------------------------------------------------------
  // Categories
  // ---------------------------------------------------------------------------
  async getCategories(): Promise<string[]> {
    const categories = await this.prisma.competitionCategory.findMany({
      orderBy: { name: 'asc' },
    });
    return categories.map((c) => c.name);
  }

  async createCategory(dto: CreateCategoryDto): Promise<string[]> {
    const name = dto.name.trim();
    if (!name) {
      throw new BadRequestException({
        message: 'Category name cannot be empty',
        errors: [{ field: 'name', message: 'Category name cannot be empty' }],
      });
    }

    const existing = await this.prisma.competitionCategory.findUnique({
      where: { name },
    });
    if (existing) {
      throw new ConflictException({
        message: 'Category already exists',
        errors: [{ field: 'name', message: 'Category already exists' }],
      });
    }

    await this.prisma.competitionCategory.create({
      data: { name },
    });

    return this.getCategories();
  }

  async deleteCategory(name: string): Promise<string[]> {
    const cat = await this.prisma.competitionCategory.findUnique({
      where: { name },
    });
    if (!cat) {
      throw new NotFoundException(`Category "${name}" not found`);
    }

    // Check if used by any team
    const usedCount = await this.prisma.competitionTeam.count({
      where: { category: name },
    });
    if (usedCount > 0) {
      throw new ConflictException({
        message: `Category "${name}" is used by ${usedCount} team(s) and cannot be deleted`,
      });
    }

    await this.prisma.competitionCategory.delete({
      where: { name },
    });

    return this.getCategories();
  }

  // ---------------------------------------------------------------------------
  // Teams
  // ---------------------------------------------------------------------------
  async getTeams(active?: boolean, category?: string): Promise<Team[]> {
    const where: any = {};
    if (active !== undefined) {
      where.active = active;
    }
    if (category) {
      where.category = category;
    }

    const teams = await this.prisma.competitionTeam.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return teams.map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      description: t.description,
      leaderId: t.leaderId,
      memberIds: t.memberIds,
      icon: t.icon,
      active: t.active,
      annualGoal: t.annualGoal ?? undefined,
      createdAt: t.createdAt.toISOString(),
    }));
  }

  async getTeam(id: string): Promise<Team> {
    const t = await this.prisma.competitionTeam.findUnique({
      where: { id },
    });
    if (!t) {
      throw new NotFoundException(`Team with ID "${id}" not found`);
    }
    return {
      id: t.id,
      name: t.name,
      category: t.category,
      description: t.description,
      leaderId: t.leaderId,
      memberIds: t.memberIds,
      icon: t.icon,
      active: t.active,
      annualGoal: t.annualGoal ?? undefined,
      createdAt: t.createdAt.toISOString(),
    };
  }

  async createTeam(dto: CreateTeamDto): Promise<Team> {
    const name = dto.name.trim();

    // 1. Name uniqueness
    const existingName = await this.prisma.competitionTeam.findUnique({
      where: { name },
    });
    if (existingName) {
      throw new ConflictException({
        message: 'Team name already exists',
        errors: [{ field: 'name', message: 'Team name already exists' }],
      });
    }

    // 2. Category must exist
    const cat = await this.prisma.competitionCategory.findUnique({
      where: { name: dto.category },
    });
    if (!cat) {
      throw new BadRequestException({
        message: `Category "${dto.category}" does not exist`,
        errors: [{ field: 'category', message: `Category "${dto.category}" does not exist` }],
      });
    }

    // 3. memberIds must contain leaderId
    if (!dto.memberIds.includes(dto.leaderId)) {
      throw new BadRequestException({
        message: 'leaderId must be included in memberIds',
        errors: [{ field: 'leaderId', message: 'leaderId must be included in memberIds' }],
      });
    }

    // 4. All memberIds must be existing users
    const users = await this.prisma.user.findMany({
      where: { id: { in: dto.memberIds } },
      select: { id: true },
    });
    const foundUserIds = new Set(users.map((u) => u.id));
    const missing = dto.memberIds.filter((id) => !foundUserIds.has(id));
    if (missing.length > 0) {
      throw new BadRequestException({
        message: `The following user IDs do not exist: ${missing.join(', ')}`,
        errors: [{ field: 'memberIds', message: `Users not found: ${missing.join(', ')}` }],
      });
    }

    // 5. Active team rule: a user can belong to only one active team
    const isActive = dto.active !== false;
    if (isActive) {
      const activeTeamsWithMembers = await this.prisma.competitionTeam.findMany({
        where: {
          active: true,
          memberIds: { hasSome: dto.memberIds },
        },
      });

      if (activeTeamsWithMembers.length > 0) {
        const conflictingUsers = new Set<string>();
        for (const team of activeTeamsWithMembers) {
          for (const mId of dto.memberIds) {
            if (team.memberIds.includes(mId)) {
              conflictingUsers.add(mId);
            }
          }
        }
        throw new ConflictException({
          message: `User(s) already belong to an active team: ${Array.from(conflictingUsers).join(', ')}`,
          errors: [
            {
              field: 'memberIds',
              message: `User(s) already belong to an active team: ${Array.from(conflictingUsers).join(', ')}`,
            },
          ],
        });
      }
    }

    const team = await this.prisma.competitionTeam.create({
      data: {
        name,
        category: dto.category,
        description: dto.description ?? null,
        leaderId: dto.leaderId,
        memberIds: dto.memberIds,
        icon: dto.icon,
        active: isActive,
        annualGoal: dto.annualGoal ?? null,
      },
    });

    return {
      id: team.id,
      name: team.name,
      category: team.category,
      description: team.description,
      leaderId: team.leaderId,
      memberIds: team.memberIds,
      icon: team.icon,
      active: team.active,
      annualGoal: team.annualGoal ?? undefined,
      createdAt: team.createdAt.toISOString(),
    };
  }

  async patchTeam(id: string, dto: PatchTeamDto): Promise<Team> {
    const existing = await this.prisma.competitionTeam.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Team with ID "${id}" not found`);
    }

    // 1. Name uniqueness if changed
    if (dto.name && dto.name.trim() !== existing.name) {
      const conflict = await this.prisma.competitionTeam.findUnique({
        where: { name: dto.name.trim() },
      });
      if (conflict && conflict.id !== id) {
        throw new ConflictException({
          message: 'Team name already exists',
          errors: [{ field: 'name', message: 'Team name already exists' }],
        });
      }
    }

    // 2. Category if changed
    if (dto.category && dto.category !== existing.category) {
      const cat = await this.prisma.competitionCategory.findUnique({
        where: { name: dto.category },
      });
      if (!cat) {
        throw new BadRequestException({
          message: `Category "${dto.category}" does not exist`,
          errors: [{ field: 'category', message: `Category "${dto.category}" does not exist` }],
        });
      }
    }

    const mergedLeaderId = dto.leaderId ?? existing.leaderId;
    const mergedMemberIds = dto.memberIds ?? existing.memberIds;
    const willBeActive = dto.active !== undefined ? dto.active : existing.active;

    // 3. leaderId in memberIds
    if (!mergedMemberIds.includes(mergedLeaderId)) {
      throw new BadRequestException({
        message: 'leaderId must be included in memberIds',
        errors: [{ field: 'leaderId', message: 'leaderId must be included in memberIds' }],
      });
    }

    // 4. Validate member IDs if modified
    if (dto.memberIds) {
      const users = await this.prisma.user.findMany({
        where: { id: { in: dto.memberIds } },
        select: { id: true },
      });
      const foundUserIds = new Set(users.map((u) => u.id));
      const missing = dto.memberIds.filter((mId) => !foundUserIds.has(mId));
      if (missing.length > 0) {
        throw new BadRequestException({
          message: `The following user IDs do not exist: ${missing.join(', ')}`,
          errors: [{ field: 'memberIds', message: `Users not found: ${missing.join(', ')}` }],
        });
      }
    }

    // 5. Active rule check
    if (willBeActive && (dto.memberIds || dto.active !== undefined)) {
      const conflictingTeams = await this.prisma.competitionTeam.findMany({
        where: {
          id: { not: id },
          active: true,
          memberIds: { hasSome: mergedMemberIds },
        },
      });

      if (conflictingTeams.length > 0) {
        const conflictingUsers = new Set<string>();
        for (const t of conflictingTeams) {
          for (const mId of mergedMemberIds) {
            if (t.memberIds.includes(mId)) {
              conflictingUsers.add(mId);
            }
          }
        }
        throw new ConflictException({
          message: `User(s) already belong to another active team: ${Array.from(conflictingUsers).join(', ')}`,
          errors: [
            {
              field: 'memberIds',
              message: `User(s) already belong to another active team: ${Array.from(conflictingUsers).join(', ')}`,
            },
          ],
        });
      }
    }

    const updated = await this.prisma.competitionTeam.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.category ? { category: dto.category } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.leaderId ? { leaderId: dto.leaderId } : {}),
        ...(dto.memberIds ? { memberIds: dto.memberIds } : {}),
        ...(dto.icon ? { icon: dto.icon } : {}),
        ...(dto.active !== undefined ? { active: dto.active } : {}),
        ...(dto.annualGoal !== undefined ? { annualGoal: dto.annualGoal } : {}),
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      category: updated.category,
      description: updated.description,
      leaderId: updated.leaderId,
      memberIds: updated.memberIds,
      icon: updated.icon,
      active: updated.active,
      annualGoal: updated.annualGoal ?? undefined,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  async deleteTeam(id: string): Promise<{ id: string }> {
    const existing = await this.prisma.competitionTeam.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Team with ID "${id}" not found`);
    }

    // Remove team from challenges.teamIds
    const challenges = await this.prisma.competitionChallenge.findMany({
      where: { teamIds: { has: id } },
    });

    for (const ch of challenges) {
      await this.prisma.competitionChallenge.update({
        where: { id: ch.id },
        data: {
          teamIds: ch.teamIds.filter((tId) => tId !== id),
        },
      });
    }

    await this.prisma.competitionTeam.delete({
      where: { id },
    });

    return { id };
  }

  // ---------------------------------------------------------------------------
  // Scoring Rules (Global Defaults)
  // ---------------------------------------------------------------------------
  async getScoringRules(): Promise<ScoringRules> {
    const rules = await this.prisma.competitionScoringRules.findUnique({
      where: { id: 'global' },
    });

    if (!rules) {
      return DEFAULT_SCORING_RULES;
    }

    return {
      lead: rules.lead,
      conversion: rules.conversion,
      consistency: rules.consistency,
      contribution: rules.contribution,
      target: rules.target,
      win: rules.win,
    };
  }

  async putScoringRules(dto: ScoringRulesDto): Promise<ScoringRules> {
    const updated = await this.prisma.competitionScoringRules.upsert({
      where: { id: 'global' },
      create: {
        id: 'global',
        lead: dto.lead,
        conversion: dto.conversion,
        consistency: dto.consistency,
        contribution: dto.contribution,
        target: dto.target,
        win: dto.win,
      },
      update: {
        lead: dto.lead,
        conversion: dto.conversion,
        consistency: dto.consistency,
        contribution: dto.contribution,
        target: dto.target,
        win: dto.win,
      },
    });

    return {
      lead: updated.lead,
      conversion: updated.conversion,
      consistency: updated.consistency,
      contribution: updated.contribution,
      target: updated.target,
      win: updated.win,
    };
  }

  // ---------------------------------------------------------------------------
  // Challenges
  // ---------------------------------------------------------------------------
  async getChallenges(archived?: boolean, active?: boolean): Promise<Challenge[]> {
    const where: any = {};
    if (archived !== undefined) {
      where.archived = archived;
    }
    if (active !== undefined) {
      where.active = active;
    }

    const challenges = await this.prisma.competitionChallenge.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return challenges.map((ch) => ({
      id: ch.id,
      name: ch.name,
      description: ch.description,
      type: ch.type as ChallengeType,
      cadence: ch.cadence as Cadence,
      start: ch.start,
      end: ch.end,
      teamIds: ch.teamIds,
      targets: ch.targets as unknown as ChallengeTarget[],
      rules: ch.rules as unknown as ScoringRules,
      archived: ch.archived,
      active: ch.active,
      reward: ch.reward,
      createdAt: ch.createdAt.toISOString(),
      updatedAt: ch.updatedAt.toISOString(),
    }));
  }

  async getChallenge(id: string): Promise<Challenge> {
    const ch = await this.prisma.competitionChallenge.findUnique({
      where: { id },
    });
    if (!ch) {
      throw new NotFoundException(`Challenge with ID "${id}" not found`);
    }

    return {
      id: ch.id,
      name: ch.name,
      description: ch.description,
      type: ch.type as ChallengeType,
      cadence: ch.cadence as Cadence,
      start: ch.start,
      end: ch.end,
      teamIds: ch.teamIds,
      targets: ch.targets as unknown as ChallengeTarget[],
      rules: ch.rules as unknown as ScoringRules,
      archived: ch.archived,
      active: ch.active,
      reward: ch.reward,
      createdAt: ch.createdAt.toISOString(),
      updatedAt: ch.updatedAt.toISOString(),
    };
  }

  async createChallenge(dto: CreateChallengeDto): Promise<Challenge> {
    if (dto.end < dto.start) {
      throw new BadRequestException({
        message: 'end date must be greater than or equal to start date',
        errors: [{ field: 'end', message: 'end date must be >= start date' }],
      });
    }

    // Validate unique target metrics
    const metricsSeen = new Set<string>();
    for (const t of dto.targets) {
      if (metricsSeen.has(t.metric)) {
        throw new BadRequestException({
          message: `Duplicate target metric: "${t.metric}". Each target must have a unique metric.`,
          errors: [{ field: 'targets', message: `Duplicate target metric: "${t.metric}"` }],
        });
      }
      metricsSeen.add(t.metric);
    }

    const rules = dto.rules ?? (await this.getScoringRules());

    const ch = await this.prisma.competitionChallenge.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        type: dto.type,
        cadence: dto.cadence,
        start: dto.start,
        end: dto.end,
        teamIds: dto.teamIds,
        targets: dto.targets as any,
        rules: rules as any,
        active: dto.active !== undefined ? dto.active : true,
        reward: dto.reward ?? '',
      },
    });

    return {
      id: ch.id,
      name: ch.name,
      description: ch.description,
      type: ch.type as ChallengeType,
      cadence: ch.cadence as Cadence,
      start: ch.start,
      end: ch.end,
      teamIds: ch.teamIds,
      targets: ch.targets as unknown as ChallengeTarget[],
      rules: ch.rules as unknown as ScoringRules,
      archived: ch.archived,
      active: ch.active,
      reward: ch.reward,
      createdAt: ch.createdAt.toISOString(),
      updatedAt: ch.updatedAt.toISOString(),
    };
  }

  async patchChallenge(id: string, dto: PatchChallengeDto): Promise<Challenge> {
    const existing = await this.prisma.competitionChallenge.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Challenge with ID "${id}" not found`);
    }

    const start = dto.start ?? existing.start;
    const end = dto.end ?? existing.end;
    if (end < start) {
      throw new BadRequestException({
        message: 'end date must be greater than or equal to start date',
        errors: [{ field: 'end', message: 'end date must be >= start date' }],
      });
    }

    if (dto.targets) {
      const metricsSeen = new Set<string>();
      for (const t of dto.targets) {
        if (metricsSeen.has(t.metric)) {
          throw new BadRequestException({
            message: `Duplicate target metric: "${t.metric}"`,
            errors: [{ field: 'targets', message: `Duplicate target metric: "${t.metric}"` }],
          });
        }
        metricsSeen.add(t.metric);
      }
    }

    const updated = await this.prisma.competitionChallenge.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.type ? { type: dto.type } : {}),
        ...(dto.cadence ? { cadence: dto.cadence } : {}),
        ...(dto.start ? { start: dto.start } : {}),
        ...(dto.end ? { end: dto.end } : {}),
        ...(dto.teamIds ? { teamIds: dto.teamIds } : {}),
        ...(dto.targets ? { targets: dto.targets as any } : {}),
        ...(dto.rules ? { rules: dto.rules as any } : {}),
        ...(dto.active !== undefined ? { active: dto.active } : {}),
        ...(dto.reward !== undefined ? { reward: dto.reward } : {}),
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      type: updated.type as ChallengeType,
      cadence: updated.cadence as Cadence,
      start: updated.start,
      end: updated.end,
      teamIds: updated.teamIds,
      targets: updated.targets as unknown as ChallengeTarget[],
      rules: updated.rules as unknown as ScoringRules,
      archived: updated.archived,
      active: updated.active,
      reward: updated.reward,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async archiveChallenge(id: string, dto: ArchiveChallengeDto): Promise<Challenge> {
    const existing = await this.prisma.competitionChallenge.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Challenge with ID "${id}" not found`);
    }

    const updated = await this.prisma.competitionChallenge.update({
      where: { id },
      data: { archived: dto.archived },
    });

    return {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      type: updated.type as ChallengeType,
      cadence: updated.cadence as Cadence,
      start: updated.start,
      end: updated.end,
      teamIds: updated.teamIds,
      targets: updated.targets as unknown as ChallengeTarget[],
      rules: updated.rules as unknown as ScoringRules,
      archived: updated.archived,
      active: updated.active,
      reward: updated.reward,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async deleteChallenge(id: string): Promise<{ id: string }> {
    const existing = await this.prisma.competitionChallenge.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Challenge with ID "${id}" not found`);
    }

    await this.prisma.competitionChallenge.delete({
      where: { id },
    });

    return { id };
  }

  // ---------------------------------------------------------------------------
  // Performance Records
  // ---------------------------------------------------------------------------
  async getPerformance(query: {
    month?: string;
    from?: string;
    to?: string;
    employeeId?: string;
    teamId?: string;
  }): Promise<PerformanceRecord[]> {
    const { month, from, to, employeeId, teamId } = query;

    // Resolve months list
    let months: string[] = [];
    if (month) {
      months = [month];
    } else if (from && to) {
      let curr = from;
      while (curr <= to) {
        months.push(curr);
        const [y, m] = curr.split('-').map(Number);
        const next = new Date(Date.UTC(y, m, 1));
        curr = next.toISOString().slice(0, 7);
      }
    } else if (from) {
      months = [from];
    } else {
      months = [this.getCurrentMonth()];
    }

    // Resolve employees
    let targetEmployeeIds: string[] = [];
    if (employeeId) {
      targetEmployeeIds = [employeeId];
    } else if (teamId) {
      const team = await this.prisma.competitionTeam.findUnique({
        where: { id: teamId },
      });
      targetEmployeeIds = team ? team.memberIds : [];
    } else {
      const users = await this.prisma.user.findMany({ select: { id: true } });
      targetEmployeeIds = users.map((u) => u.id);
    }

    const records: PerformanceRecord[] = [];

    for (const m of months) {
      const startOfMonth = new Date(`${m}-01T00:00:00.000Z`);
      const [y, mm] = m.split('-').map(Number);
      const endOfMonth = new Date(Date.UTC(y, mm, 0, 23, 59, 59, 999));

      // Fetch manual records for this month
      const manualRecords = await this.prisma.competitionPerformance.findMany({
        where: {
          month: m,
          employeeId: { in: targetEmployeeIds },
        },
      });
      const manualMap = new Map(manualRecords.map((r) => [r.employeeId, r]));

      for (const empId of targetEmployeeIds) {
        const manual = manualMap.get(empId);
        if (manual && manual.isManual) {
          records.push({
            employeeId: empId,
            month: m,
            leads: manual.leads,
            converted: manual.converted,
            consistency: manual.consistency,
            contribution: manual.contribution,
            streak: manual.streak,
            revenue: manual.revenue,
            tasks: manual.tasks,
          });
          continue;
        }

        // Compute from real data
        const [leadsCount, convertedCount, tasksCount] = await Promise.all([
          this.prisma.lead.count({
            where: {
              addedById: empId,
              createdAt: { gte: startOfMonth, lte: endOfMonth },
            },
          }),
          this.prisma.lead.count({
            where: {
              status: 'CONVERTED',
              OR: [{ addedById: empId }, { assignedToId: empId }],
              createdAt: { gte: startOfMonth, lte: endOfMonth },
            },
          }),
          this.prisma.task.count({
            where: {
              status: 'DONE',
              assignees: { some: { userId: empId } },
              updatedAt: { gte: startOfMonth, lte: endOfMonth },
            },
          }),
        ]);

        const consistency = Math.min(
          100,
          Math.max(20, Math.round((tasksCount * 10 + leadsCount * 5) || 50)),
        );
        const contribution = Math.min(
          100,
          Math.max(20, Math.round((leadsCount + convertedCount) * 15 || 50)),
        );
        const streak = Math.max(1, Math.min(30, leadsCount + tasksCount));
        const revenue = convertedCount * 50000; // estimated BDT per converted lead

        records.push({
          employeeId: empId,
          month: m,
          leads: manual ? manual.leads : leadsCount,
          converted: manual ? manual.converted : convertedCount,
          consistency: manual ? manual.consistency : consistency,
          contribution: manual ? manual.contribution : contribution,
          streak: manual ? manual.streak : streak,
          revenue: manual ? manual.revenue : revenue,
          tasks: manual ? manual.tasks : tasksCount,
        });
      }
    }

    return records;
  }

  async upsertPerformance(dto: UpsertPerformanceDto): Promise<PerformanceRecord> {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.employeeId },
    });
    if (!user) {
      throw new NotFoundException(`Employee with ID "${dto.employeeId}" not found`);
    }

    const leads = dto.leads ?? 0;
    const converted = dto.converted ?? 0;
    const consistency = dto.consistency ?? 0;
    const contribution = dto.contribution ?? 0;
    const streak = dto.streak ?? 0;
    const revenue = dto.revenue ?? 0;
    const tasks = dto.tasks ?? 0;

    const upserted = await this.prisma.competitionPerformance.upsert({
      where: {
        employeeId_month: {
          employeeId: dto.employeeId,
          month: dto.month,
        },
      },
      create: {
        employeeId: dto.employeeId,
        month: dto.month,
        leads,
        converted,
        consistency,
        contribution,
        streak,
        revenue,
        tasks,
        isManual: true,
      },
      update: {
        ...(dto.leads !== undefined ? { leads: dto.leads } : {}),
        ...(dto.converted !== undefined ? { converted: dto.converted } : {}),
        ...(dto.consistency !== undefined ? { consistency: dto.consistency } : {}),
        ...(dto.contribution !== undefined ? { contribution: dto.contribution } : {}),
        ...(dto.streak !== undefined ? { streak: dto.streak } : {}),
        ...(dto.revenue !== undefined ? { revenue: dto.revenue } : {}),
        ...(dto.tasks !== undefined ? { tasks: dto.tasks } : {}),
        isManual: true,
      },
    });

    return {
      employeeId: upserted.employeeId,
      month: upserted.month,
      leads: upserted.leads,
      converted: upserted.converted,
      consistency: upserted.consistency,
      contribution: upserted.contribution,
      streak: upserted.streak,
      revenue: upserted.revenue,
      tasks: upserted.tasks,
    };
  }

  // ---------------------------------------------------------------------------
  // Badges
  // ---------------------------------------------------------------------------
  async getBadges(): Promise<Badge[]> {
    const badges = await this.prisma.competitionBadge.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return badges.map((b) => ({
      id: b.id,
      title: b.title,
      description: b.description,
      icon: b.icon,
      metric: b.metric as TargetMetric,
      target: b.target,
    }));
  }

  async createBadge(dto: CreateBadgeDto): Promise<Badge> {
    const b = await this.prisma.competitionBadge.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        icon: dto.icon,
        metric: dto.metric,
        target: dto.target,
      },
    });

    return {
      id: b.id,
      title: b.title,
      description: b.description,
      icon: b.icon,
      metric: b.metric as TargetMetric,
      target: b.target,
    };
  }

  async patchBadge(id: string, dto: PatchBadgeDto): Promise<Badge> {
    const existing = await this.prisma.competitionBadge.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Badge with ID "${id}" not found`);
    }

    const updated = await this.prisma.competitionBadge.update({
      where: { id },
      data: {
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.icon ? { icon: dto.icon } : {}),
        ...(dto.metric ? { metric: dto.metric } : {}),
        ...(dto.target !== undefined ? { target: dto.target } : {}),
      },
    });

    return {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      icon: updated.icon,
      metric: updated.metric as TargetMetric,
      target: updated.target,
    };
  }

  async deleteBadge(id: string): Promise<{ id: string }> {
    const existing = await this.prisma.competitionBadge.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Badge with ID "${id}" not found`);
    }

    await this.prisma.competitionBadge.delete({
      where: { id },
    });

    return { id };
  }

  async getBadgeEarners(badgeId: string): Promise<
    Array<{
      employeeId: string;
      name: string;
      avatar: string | null;
      value: number;
      earnedAt: string;
    }>
  > {
    const badge = await this.prisma.competitionBadge.findUnique({
      where: { id: badgeId },
    });
    if (!badge) {
      throw new NotFoundException(`Badge with ID "${badgeId}" not found`);
    }

    // Earners through direct achievements
    const achievements = await this.prisma.competitionAchievement.findMany({
      where: { badgeId },
      orderBy: { createdAt: 'desc' },
    });

    const employees = await this.getEmployees();
    const empMap = new Map(employees.map((e) => [e.id, e]));

    const earnerMap = new Map<
      string,
      { employeeId: string; name: string; avatar: string | null; value: number; earnedAt: string }
    >();

    for (const ach of achievements) {
      const emp = empMap.get(ach.recipientId);
      if (emp) {
        earnerMap.set(emp.id, {
          employeeId: emp.id,
          name: emp.name,
          avatar: emp.avatar,
          value: badge.target,
          earnedAt: ach.date,
        });
      }
    }

    // Earners through performance records
    const records = await this.getPerformance({ month: this.getCurrentMonth() });
    for (const rec of records) {
      const metricVal = Number((rec as any)[badge.metric] ?? 0);
      if (metricVal >= badge.target && !earnerMap.has(rec.employeeId)) {
        const emp = empMap.get(rec.employeeId);
        if (emp) {
          earnerMap.set(emp.id, {
            employeeId: emp.id,
            name: emp.name,
            avatar: emp.avatar,
            value: metricVal,
            earnedAt: `${rec.month}-01`,
          });
        }
      }
    }

    return Array.from(earnerMap.values());
  }

  // ---------------------------------------------------------------------------
  // Achievements
  // ---------------------------------------------------------------------------
  async getAchievements(recipientId?: string, month?: string): Promise<Achievement[]> {
    const where: any = {};
    if (recipientId) {
      where.recipientId = recipientId;
    }
    if (month) {
      where.date = { startsWith: month };
    }

    const achs = await this.prisma.competitionAchievement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return achs.map((a) => ({
      id: a.id,
      name: a.name,
      recipientId: a.recipientId,
      date: a.date,
      description: a.description ?? undefined,
      badgeId: a.badgeId ?? undefined,
    }));
  }

  async createAchievement(dto: CreateAchievementDto): Promise<Achievement> {
    const recipient = await this.prisma.user.findUnique({
      where: { id: dto.recipientId },
    });
    if (!recipient) {
      throw new BadRequestException({
        message: `Recipient user with ID "${dto.recipientId}" does not exist`,
        errors: [{ field: 'recipientId', message: 'Recipient not found' }],
      });
    }

    const ach = await this.prisma.competitionAchievement.create({
      data: {
        name: dto.name,
        recipientId: dto.recipientId,
        date: dto.date,
        description: dto.description ?? null,
        badgeId: dto.badgeId ?? null,
      },
    });

    return {
      id: ach.id,
      name: ach.name,
      recipientId: ach.recipientId,
      date: ach.date,
      description: ach.description ?? undefined,
      badgeId: ach.badgeId ?? undefined,
    };
  }

  async deleteAchievement(id: string): Promise<{ id: string }> {
    const existing = await this.prisma.competitionAchievement.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Achievement with ID "${id}" not found`);
    }

    await this.prisma.competitionAchievement.delete({
      where: { id },
    });

    return { id };
  }

  // ---------------------------------------------------------------------------
  // Milestones
  // ---------------------------------------------------------------------------
  async getMilestones(active?: boolean): Promise<Milestone[]> {
    const where: any = {};
    if (active !== undefined) {
      where.active = active;
    }

    const list = await this.prisma.competitionMilestone.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return list.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      metric: m.metric as MilestoneMetric,
      target: m.target,
      start: m.start,
      end: m.end,
      active: m.active,
    }));
  }

  async createMilestone(dto: CreateMilestoneDto): Promise<Milestone> {
    const m = await this.prisma.competitionMilestone.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        metric: dto.metric,
        target: dto.target,
        start: dto.start,
        end: dto.end,
        active: dto.active !== undefined ? dto.active : true,
      },
    });

    return {
      id: m.id,
      title: m.title,
      description: m.description,
      metric: m.metric as MilestoneMetric,
      target: m.target,
      start: m.start,
      end: m.end,
      active: m.active,
    };
  }

  async patchMilestone(id: string, dto: PatchMilestoneDto): Promise<Milestone> {
    const existing = await this.prisma.competitionMilestone.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Milestone with ID "${id}" not found`);
    }

    const updated = await this.prisma.competitionMilestone.update({
      where: { id },
      data: {
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.metric ? { metric: dto.metric } : {}),
        ...(dto.target !== undefined ? { target: dto.target } : {}),
        ...(dto.start ? { start: dto.start } : {}),
        ...(dto.end ? { end: dto.end } : {}),
        ...(dto.active !== undefined ? { active: dto.active } : {}),
      },
    });

    return {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      metric: updated.metric as MilestoneMetric,
      target: updated.target,
      start: updated.start,
      end: updated.end,
      active: updated.active,
    };
  }

  async deleteMilestone(id: string): Promise<{ id: string }> {
    const existing = await this.prisma.competitionMilestone.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Milestone with ID "${id}" not found`);
    }

    await this.prisma.competitionMilestone.delete({
      where: { id },
    });

    return { id };
  }

  async getMilestoneProgress(id: string) {
    const milestone = await this.prisma.competitionMilestone.findUnique({
      where: { id },
    });
    if (!milestone) {
      throw new NotFoundException(`Milestone with ID "${id}" not found`);
    }

    const startDate = new Date(`${milestone.start}T00:00:00.000Z`);
    const endDate = new Date(`${milestone.end}T23:59:59.999Z`);

    const employees = await this.getEmployees();
    const empMap = new Map(employees.map((e) => [e.id, e]));

    const contributorMap = new Map<string, number>();

    if (milestone.metric === MilestoneMetric.LEADS) {
      const leads = await this.prisma.lead.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          addedById: { not: null },
        },
        select: { addedById: true },
      });
      for (const l of leads) {
        if (l.addedById) {
          contributorMap.set(l.addedById, (contributorMap.get(l.addedById) ?? 0) + 1);
        }
      }
    } else if (milestone.metric === MilestoneMetric.CONVERTED) {
      const convertedLeads = await this.prisma.lead.findMany({
        where: {
          status: 'CONVERTED',
          createdAt: { gte: startDate, lte: endDate },
        },
        select: { addedById: true, assignedToId: true },
      });
      for (const l of convertedLeads) {
        const uId = l.assignedToId || l.addedById;
        if (uId) {
          contributorMap.set(uId, (contributorMap.get(uId) ?? 0) + 1);
        }
      }
    } else if (milestone.metric === MilestoneMetric.TASKS) {
      const tasks = await this.prisma.task.findMany({
        where: {
          status: 'DONE',
          updatedAt: { gte: startDate, lte: endDate },
        },
        select: {
          assignees: { select: { userId: true } },
        },
      });
      for (const t of tasks) {
        for (const a of t.assignees) {
          contributorMap.set(a.userId, (contributorMap.get(a.userId) ?? 0) + 1);
        }
      }
    } else if (milestone.metric === MilestoneMetric.REVENUE) {
      const convertedLeads = await this.prisma.lead.findMany({
        where: {
          status: 'CONVERTED',
          createdAt: { gte: startDate, lte: endDate },
        },
        select: { addedById: true, assignedToId: true },
      });
      for (const l of convertedLeads) {
        const uId = l.assignedToId || l.addedById;
        if (uId) {
          contributorMap.set(uId, (contributorMap.get(uId) ?? 0) + 50000);
        }
      }
    }

    let current = 0;
    const contributors: Array<{
      employeeId: string;
      name: string;
      avatar: string | null;
      value: number;
    }> = [];

    for (const [eId, val] of contributorMap.entries()) {
      current += val;
      const emp = empMap.get(eId);
      if (emp) {
        contributors.push({
          employeeId: emp.id,
          name: emp.name,
          avatar: emp.avatar,
          value: val,
        });
      }
    }

    contributors.sort((a, b) => b.value - a.value);

    const percent =
      milestone.target > 0
        ? Math.min(100, Math.round((current / milestone.target) * 100))
        : 0;

    return {
      milestoneId: milestone.id,
      current,
      target: milestone.target,
      percent,
      contributors,
    };
  }

  // ---------------------------------------------------------------------------
  // Leaderboards
  // ---------------------------------------------------------------------------
  async getTeamsLeaderboard(month?: string, challengeId?: string) {
    const selectedMonth = month || this.getCurrentMonth();

    let rules = await this.getScoringRules();
    let challengeTargets: ChallengeTarget[] = [];

    if (challengeId) {
      const ch = await this.prisma.competitionChallenge.findUnique({
        where: { id: challengeId },
      });
      if (ch) {
        rules = ch.rules as unknown as ScoringRules;
        challengeTargets = ch.targets as unknown as ChallengeTarget[];
      }
    }

    const teams = await this.getTeams(true);
    const records = await this.getPerformance({ month: selectedMonth });
    const recMap = new Map(records.map((r) => [r.employeeId, r]));

    const teamScores: Array<{
      teamId: string;
      name: string;
      icon: string;
      category: string;
      leads: number;
      converted: number;
      revenue: number;
      rate: number;
      points: number;
    }> = [];

    for (const team of teams) {
      let leads = 0;
      let converted = 0;
      let revenue = 0;
      let totalConsistency = 0;
      let totalContribution = 0;

      for (const mId of team.memberIds) {
        const rec = recMap.get(mId);
        if (rec) {
          leads += rec.leads;
          converted += rec.converted;
          revenue += rec.revenue;
          totalConsistency += rec.consistency;
          totalContribution += rec.contribution;
        }
      }

      const memberCount = Math.max(1, team.memberIds.length);
      const consistency = totalConsistency / memberCount;
      const contribution = totalContribution / memberCount;

      const rate =
        leads > 0 ? Math.round((converted / leads) * 100 * 100) / 100 : 0;

      let points =
        leads * rules.lead +
        converted * rules.conversion +
        (consistency * rules.consistency) / 100 +
        (contribution * rules.contribution) / 100;

      // Add target bonus only if EVERY target is reached
      if (challengeTargets.length > 0) {
        const everyTargetMet = challengeTargets.every((t) => {
          if (t.metric === ChallengeParameter.LEADS) return leads >= t.target;
          if (t.metric === ChallengeParameter.CONVERTED)
            return converted >= t.target;
          if (t.metric === ChallengeParameter.REVENUE)
            return revenue >= t.target;
          return false;
        });

        if (everyTargetMet) {
          points += rules.target;
        }
      }

      teamScores.push({
        teamId: team.id,
        name: team.name,
        icon: team.icon,
        category: team.category,
        leads,
        converted,
        revenue,
        rate,
        points: Math.round(points * 100) / 100,
      });
    }

    teamScores.sort((a, b) => b.points - a.points);

    return teamScores.map((t, idx) => ({
      rank: idx + 1,
      ...t,
    }));
  }

  async getIndividualsLeaderboard(
    month?: string,
    teamId?: string,
    challengeId?: string,
  ) {
    const selectedMonth = month || this.getCurrentMonth();

    let rules = await this.getScoringRules();
    let challengeTargets: ChallengeTarget[] = [];

    if (challengeId) {
      const ch = await this.prisma.competitionChallenge.findUnique({
        where: { id: challengeId },
      });
      if (ch) {
        rules = ch.rules as unknown as ScoringRules;
        challengeTargets = ch.targets as unknown as ChallengeTarget[];
      }
    }

    const employees = await this.getEmployees();
    const activeTeams = await this.getTeams(true);

    const userTeamMap = new Map<string, string>();
    for (const team of activeTeams) {
      for (const mId of team.memberIds) {
        userTeamMap.set(mId, team.id);
      }
    }

    let filteredEmployees = employees;
    if (teamId) {
      filteredEmployees = employees.filter(
        (e) => userTeamMap.get(e.id) === teamId,
      );
    }

    const records = await this.getPerformance({
      month: selectedMonth,
      teamId,
    });
    const recMap = new Map(records.map((r) => [r.employeeId, r]));

    const scores: Array<{
      employeeId: string;
      name: string;
      avatar: string | null;
      teamId?: string;
      leads: number;
      converted: number;
      revenue: number;
      rate: number;
      points: number;
      streak: number;
    }> = [];

    for (const emp of filteredEmployees) {
      const rec = recMap.get(emp.id) ?? {
        employeeId: emp.id,
        month: selectedMonth,
        leads: 0,
        converted: 0,
        consistency: 0,
        contribution: 0,
        streak: 0,
        revenue: 0,
        tasks: 0,
      };

      const rate =
        rec.leads > 0
          ? Math.round((rec.converted / rec.leads) * 100 * 100) / 100
          : 0;

      let points =
        rec.leads * rules.lead +
        rec.converted * rules.conversion +
        (rec.consistency * rules.consistency) / 100 +
        (rec.contribution * rules.contribution) / 100;

      if (challengeTargets.length > 0) {
        const everyTargetMet = challengeTargets.every((t) => {
          if (t.metric === ChallengeParameter.LEADS) return rec.leads >= t.target;
          if (t.metric === ChallengeParameter.CONVERTED)
            return rec.converted >= t.target;
          if (t.metric === ChallengeParameter.REVENUE)
            return rec.revenue >= t.target;
          return false;
        });

        if (everyTargetMet) {
          points += rules.target;
        }
      }

      scores.push({
        employeeId: emp.id,
        name: emp.name,
        avatar: emp.avatar,
        teamId: userTeamMap.get(emp.id),
        leads: rec.leads,
        converted: rec.converted,
        revenue: rec.revenue,
        rate,
        points: Math.round(points * 100) / 100,
        streak: rec.streak,
      });
    }

    scores.sort((a, b) => b.points - a.points);

    return scores.map((s, idx) => ({
      rank: idx + 1,
      ...s,
    }));
  }

  // ---------------------------------------------------------------------------
  // Winning History (Immutable)
  // ---------------------------------------------------------------------------
  async getWinners(year?: string, month?: string): Promise<MonthlyWinners[]> {
    const where: any = {};
    if (month) {
      where.month = month;
    } else if (year) {
      where.month = { startsWith: year };
    }

    const rows = await this.prisma.competitionMonthlyWinners.findMany({
      where,
      orderBy: { month: 'desc' },
    });

    return rows.map((r) => ({
      month: r.month,
      team: (r.team as unknown as WinnerSnapshot) ?? undefined,
      individual: (r.individual as unknown as WinnerSnapshot) ?? undefined,
    }));
  }

  async finalizeWinners(month: string): Promise<MonthlyWinners> {
    const existing = await this.prisma.competitionMonthlyWinners.findUnique({
      where: { month },
    });
    if (existing) {
      throw new ConflictException({
        message: `Month "${month}" has already been finalized`,
      });
    }

    const currentMonth = this.getCurrentMonth();
    if (month >= currentMonth) {
      throw new ConflictException({
        message: `Cannot finalize month "${month}" because it has not ended yet (current month: ${currentMonth})`,
      });
    }

    const [teamsLb, indLb] = await Promise.all([
      this.getTeamsLeaderboard(month),
      this.getIndividualsLeaderboard(month),
    ]);

    const topTeam = teamsLb[0];
    const topInd = indLb[0];

    const teamSnapshot: WinnerSnapshot | undefined = topTeam
      ? {
          id: topTeam.teamId,
          name: topTeam.name,
          category: topTeam.category,
          team: topTeam.name,
          leads: topTeam.leads,
          converted: topTeam.converted,
          rate: topTeam.rate,
          contribution: 100,
          points: topTeam.points,
          achievements: [],
        }
      : undefined;

    let individualSnapshot: WinnerSnapshot | undefined = undefined;
    if (topInd) {
      const achs = await this.getAchievements(topInd.employeeId, month);
      individualSnapshot = {
        id: topInd.employeeId,
        name: topInd.name,
        team: topInd.teamId,
        avatar: topInd.avatar ?? undefined,
        leads: topInd.leads,
        converted: topInd.converted,
        rate: topInd.rate,
        contribution: 100,
        points: topInd.points,
        achievements: achs.map((a) => a.name),
      };
    }

    const created = await this.prisma.competitionMonthlyWinners.create({
      data: {
        month,
        team: teamSnapshot as any,
        individual: individualSnapshot as any,
      },
    });

    this.notificationsService.notifyMonthlyReport({
      month,
      reportTitle: `Monthly Competition Winners Finalized (${month})`,
    }).catch((err) => console.error('[CompetitionService] Notification error:', err));

    return {
      month: created.month,
      team: (created.team as unknown as WinnerSnapshot) ?? undefined,
      individual: (created.individual as unknown as WinnerSnapshot) ?? undefined,
    };
  }
}

