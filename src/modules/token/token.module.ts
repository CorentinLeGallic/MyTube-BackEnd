import { Module } from "@nestjs/common";
import { TokenService } from "./token.service";
import { UserModule } from "modules/user/user.module";
import { PrismaModule } from "common/prisma/prisma.module";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TokenRepository } from "./token.repository";

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        privateKey: config.get<string>("JWT_PRIVATE_KEY"),
        publicKey: config.get<string>("JWT_PUBLIC_KEY"),
        signOptions: {
          algorithm: "RS256",
          expiresIn: `${config.getOrThrow<number>("ACCESS_TOKEN_LIFETIME_MINUTES")}m`,
        },
      }),
    }),
    UserModule,
    PrismaModule,
  ],
  providers: [TokenService, TokenRepository],
  exports: [TokenService, TokenRepository],
})
export class TokenModule {}
