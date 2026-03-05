import { Injectable } from "@nestjs/common";
import { TokenService } from "modules/token/token.service";
import { UserService } from "modules/user/user.service";
import { EmailAldreadyInUseException, InvalidCredentialsException } from "./auth.exceptions";
import { TokenRepository } from "modules/token/token.repository";
import { UserRepository } from "modules/user/user.repository";

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private userRepository: UserRepository,
    private tokenService: TokenService,
    private tokenRepository: TokenRepository,
  ) {}

  async signUp(email: string, password: string, name: string) {
    const isEmailTaken = await this.userService.isEmailTaken(email);
    if (isEmailTaken) throw new EmailAldreadyInUseException();

    const newUser = await this.userService.create(email, password, name);

    return this.tokenService.generateTokens(newUser.id);
  }

  async signIn(email: string, password: string) {
    const user = await this.userRepository.findOneByEmail(email);

    if (!user) throw new InvalidCredentialsException();

    const isPasswordValid = await this.userService.isPasswordValid(user, password);

    if (!isPasswordValid) throw new InvalidCredentialsException();

    const tokens = await this.tokenService.generateTokens(user.id);

    return tokens;
  }

  async logOut(refreshTokenCookie: string | null) {
    if (!refreshTokenCookie) return;

    const { refreshTokenId, refreshTokenValue } =
      this.tokenService.parseRefreshTokenCookie(refreshTokenCookie);

    if (!refreshTokenId || !refreshTokenValue) return;

    const tokenData = await this.tokenRepository.findRefreshToken(refreshTokenId);

    if (!tokenData) return;

    await this.tokenRepository.revokeRefreshTokenFamily(tokenData.family_id);
  }

  async refresh(refreshTokenCookie: string | null) {
    return this.tokenService.rotateRefreshToken(refreshTokenCookie);
  }
}
