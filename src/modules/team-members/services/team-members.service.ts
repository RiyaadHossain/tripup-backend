import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'generated/src/prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

import { CreateTeamMemberDto } from '../dto/create-team-member.dto';
import { UpdateTeamMemberDto } from '../dto/update-team-member.dto';
import { QueryTeamMembersDto } from '../dto/query-team-members.dto';

@Injectable()
export class TeamMembersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTeamMemberDto) {
    const { profileImg, ...rest } = dto;

    return this.prisma.teamMember.create({
      data: {
        ...rest,
        profileImg,
      },
    });
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

  async update(id: string, dto: UpdateTeamMemberDto) {
    const existing = await this.prisma.teamMember.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Team member not found');
    }

    const { profileImg, ...rest } = dto;

    return this.prisma.teamMember.update({
      where: { id },
      data: {
        ...rest,
        profileImg,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.teamMember.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Team member not found');
    }

    return this.prisma.teamMember.delete({
      where: { id },
    });
  }

  async removeMany(ids: string[]) {
    return this.prisma.teamMember.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
