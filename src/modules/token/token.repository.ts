import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "common/prisma/prisma.service";
import dayjs from "dayjs";

@Injectable()
export class TokenRepository {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async findRefreshToken(id: string) {
    return this.prisma.refreshToken.findUnique({
      where: {
        id,
      },
    });
  }

  async findRefreshTokenAndFamily(id: string) {
    return this.prisma.refreshToken.findUnique({
      where: {
        id,
      },
      include: {
        family: true,
      },
    });
  }

  async createRefreshToken(hashedTokenValue: string, familyId: string) {
    const lifetimeDays = this.configService.getOrThrow<number>("REFRESH_TOKEN_LIFETIME_DAYS");

    const newRefreshToken = await this.prisma.refreshToken.create({
      data: {
        hashed_value: hashedTokenValue,
        family_id: familyId,
        expires_at: dayjs().add(lifetimeDays, "day").toDate(),
      },
    });

    return newRefreshToken;
  }

  async createRefreshTokenFamily(userId: string) {
    return this.prisma.refreshTokenFamily.create({
      data: {
        user_id: userId,
      },
    });
  }

  async revokeRefreshToken(refreshTokenId: string) {
    await this.prisma.refreshToken.update({
      where: {
        id: refreshTokenId,
      },
      data: {
        revoked_at: new Date(),
      },
    });
  }

  async useRefreshToken(refreshTokenId: string) {
    await this.prisma.refreshToken.update({
      where: {
        id: refreshTokenId,
      },
      data: {
        used_at: new Date(),
      },
    });
  }

  async revokeRefreshTokenFamily(familyId: string) {
    await this.prisma.refreshTokenFamily.update({
      where: {
        id: familyId,
      },
      data: {
        revoked_at: new Date(),
      },
    });
  }

  async revokeAllRefreshTokensInFamilyExcept(familyId: string, omitTokensIds: string[]) {
    await this.prisma.refreshToken.updateMany({
      where: {
        family_id: familyId,
        id: {
          notIn: omitTokensIds,
        },
      },
      data: {
        revoked_at: new Date(),
      },
    });
  }
}
