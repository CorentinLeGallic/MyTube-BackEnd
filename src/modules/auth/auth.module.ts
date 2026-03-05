import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UserModule } from "modules/user/user.module";
import { TokenModule } from "modules/token/token.module";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "@guards/auth.guard";

@Module({
  imports: [UserModule, TokenModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
