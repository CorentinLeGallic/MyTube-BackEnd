import { Injectable } from "@nestjs/common";
import { PrismaService } from "common/prisma/prisma.service";

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async findOneByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async countByEmail(email: string) {
    return await this.prisma.user.count({
      where: {
        email,
      },
    });
  }

  async create(data: { email: string; hashedPassword: string; name: string }) {
    const { email, hashedPassword, name } = data;

    return this.prisma.user.create({
      data: {
        name,
        email,
        hashed_password: hashedPassword,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }
}
