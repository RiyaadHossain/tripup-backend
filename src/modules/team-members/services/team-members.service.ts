import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'generated/src/prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

import { CreateTeamMemberDto } from '../dto/create-team-member.dto';
import { UpdateTeamMemberDto } from '../dto/update-team-member.dto';
import { QueryTeamMembersDto } from '../dto/query-team-members.dto';
import { UserActivityService } from 'src/modules/user-activity/user-activity.service';

@Injectable()
export class TeamMembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: UserActivityService,
  ) {}

  async create(dto: CreateTeamMemberDto, userId: string) {
    const { profileImg, ...rest } = dto;

    const member = await this.prisma.teamMember.create({ data: { addedBy: userId ? { connect: { id: userId } } : undefined,
        ...rest,
        profileImg,
      },
    });

    this.activityService.log('CREATE', 'team_members', userId, {
      id: member.id,
      name: member.name,
    });

    return member;
  }

  async findAll(query: QueryTeamMembersDto) {
    const { page, limit, search, isPublished } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.TeamMemberWhereInput = {};

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          designation: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (isPublished !== undefined) {
      where.isPublished = isPublished === 'true';
    }

    const [data, total] = await Promise.all([
      this.prisma.teamMember.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          displayOrder: 'asc',
        },
      }),

      this.prisma.teamMember.count({ where }),
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

  async update(id: string, dto: UpdateTeamMemberDto, userId?: string) {
    const existing = await this.prisma.teamMember.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Team member not found');
    }

    const { profileImg, ...rest } = dto;

    const updated = await this.prisma.teamMember.update({
      where: { id },
      data: {
        ...rest,
        profileImg,
      },
    });

    this.activityService.log('UPDATE', 'team_members', userId, {
      id: updated.id,
      name: updated.name,
    });

    return updated;
  }

  async remove(id: string, userId?: string) {
    const existing = await this.prisma.teamMember.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Team member not found');
    }

    this.activityService.log('DELETE', 'team_members', userId, {
      id: existing.id,
      name: existing.name,
    });

    return this.prisma.teamMember.delete({
      where: { id },
    });
  }

  async removeMany(ids: string[], userId?: string) {
    this.activityService.log('DELETE', 'team_members', userId, null);
    return this.prisma.teamMember.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
