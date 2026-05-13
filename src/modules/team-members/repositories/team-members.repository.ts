import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/src/prisma/browser';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class TeamMembersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.TeamMemberCreateInput) {
    return this.prisma.teamMember.create({ data });
  }

  async findMany(params: Prisma.TeamMemberFindManyArgs) {
    return this.prisma.teamMember.findMany(params);
  }

  async count(where?: Prisma.TeamMemberWhereInput) {
    return this.prisma.teamMember.count({ where });
  }

  async findById(id: string) {
    return this.prisma.teamMember.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.TeamMemberUpdateInput) {
    return this.prisma.teamMember.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.teamMember.delete({
      where: { id },
    });
  }

  async deleteMany(ids: string[]) {
    return this.prisma.teamMember.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
