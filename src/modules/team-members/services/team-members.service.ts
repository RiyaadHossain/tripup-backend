import { Injectable, NotFoundException } from '@nestjs/common';

import { TeamMembersRepository } from '../repositories/team-members.repository';

import { CreateTeamMemberDto } from '../dto/create-team-member.dto';
import { UpdateTeamMemberDto } from '../dto/update-team-member.dto';
import { QueryTeamMembersDto } from '../dto/query-team-members.dto';

@Injectable()
export class TeamMembersService {
  constructor(private readonly repository: TeamMembersRepository) {}

  async create(dto: CreateTeamMemberDto) {
    const { profileImg, ...rest } = dto;

    return this.repository.create({
      ...rest,
      profileImg,
    });
  }

  async findAll(query: QueryTeamMembersDto) {
    const { page, limit, search, isPublished } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

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
      this.repository.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          displayOrder: 'asc',
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

  async update(id: string, dto: UpdateTeamMemberDto) {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Team member not found');
    }

    const { profileImg, ...rest } = dto;

    return this.repository.update(id, {
      ...rest,
      profileImg,
    });
  }

  async remove(id: string) {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Team member not found');
    }

    return this.repository.delete(id);
  }

  async removeMany(ids: string[]) {
    return this.repository.deleteMany(ids);
  }
}
