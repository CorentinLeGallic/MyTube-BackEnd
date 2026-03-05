import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { PrismaModule } from "common/prisma/prisma.module";
import { UserRepository } from "./user.repository";

@Module({
  imports: [PrismaModule],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
