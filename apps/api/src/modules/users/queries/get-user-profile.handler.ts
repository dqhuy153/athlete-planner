import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@athlete-planner/database';
import { GetUserProfileQuery } from './get-user-profile.query';

@QueryHandler(GetUserProfileQuery)
export class GetUserProfileHandler implements IQueryHandler<GetUserProfileQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetUserProfileQuery) {
    const user = await this.prisma.user.findUnique({
      where: { id: query.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        tier: true,
        role: true,
        preferredLevel: true,
        referenceWeightKg: true,
        referencePaceMinPerKm: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
