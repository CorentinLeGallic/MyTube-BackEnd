import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare, hash } from "bcrypt";
import { randomBytes } from "crypto";
import { TokenRepository } from "./token.repository";
import { InvalidRefreshTokenException } from "./token.exceptions";

const SALT_ROUNDS = 10;

@Injectable()
export class TokenService {
  constructor(
    private tokenRepository: TokenRepository,
    private jwtService: JwtService,
  ) {}

  async generateTokens(userId: string, familyId?: string) {
    const newRefreshTokenCookie = familyId
      ? await this.createChildRefreshTokenCookie(familyId)
      : await this.createRootRefreshTokenCookie(userId);

    const newAccessToken = await this.generateAccessToken(userId);

    return {
      refreshToken: newRefreshTokenCookie,
      accessToken: newAccessToken,
    };
  }

  async rotateRefreshToken(refreshTokenCookie: string | null) {
    const refreshTokenData = await this.validateAndGetRefreshTokenData(refreshTokenCookie);

    await this.tokenRepository.useRefreshToken(refreshTokenData.id);

    return this.generateTokens(refreshTokenData.family.user_id, refreshTokenData.family.id);
  }

  async validateAndGetRefreshTokenData(refreshTokenCookie: string | null) {
    if (!refreshTokenCookie) throw new InvalidRefreshTokenException();

    const { refreshTokenId, refreshTokenValue } = this.parseRefreshTokenCookie(refreshTokenCookie);

    if (!refreshTokenId || !refreshTokenValue) throw new InvalidRefreshTokenException();

    const refreshTokenData = await this.tokenRepository.findRefreshTokenAndFamily(refreshTokenId);

    if (!refreshTokenData) throw new InvalidRefreshTokenException();
    if (!refreshTokenData.family) throw new InvalidRefreshTokenException();
    if (refreshTokenData.expires_at <= new Date()) throw new InvalidRefreshTokenException();

    if (refreshTokenData.revoked_at && refreshTokenData.revoked_at <= new Date())
      throw new InvalidRefreshTokenException();

    if (refreshTokenData.family.revoked_at && refreshTokenData.family.revoked_at <= new Date())
      throw new InvalidRefreshTokenException();

    const isPayloadValid = await compare(refreshTokenValue, refreshTokenData.hashed_value);

    if (!isPayloadValid) throw new InvalidRefreshTokenException();

    if (refreshTokenData.used_at && refreshTokenData.used_at <= new Date()) {
      await this.tokenRepository.revokeRefreshTokenFamily(refreshTokenData.family_id);
      throw new InvalidRefreshTokenException();
    }

    return refreshTokenData;
  }

  parseRefreshTokenCookie(refreshTokenCookie: string) {
    const [refreshTokenId, refreshTokenValue] = refreshTokenCookie.split(".");

    return { refreshTokenId, refreshTokenValue };
  }

  // Private methods

  private async createRootRefreshTokenCookie(userId: string) {
    const refreshTokenValue = this.generateRefreshTokenValue();
    const hashedRefreshTokenValue = await this.hashRefreshTokenValue(refreshTokenValue);

    const { id: familyId } = await this.tokenRepository.createRefreshTokenFamily(userId);

    const refreshTokenData = await this.tokenRepository.createRefreshToken(
      hashedRefreshTokenValue,
      familyId,
    );

    return `${refreshTokenData.id}.${refreshTokenValue}`;
  }

  private async createChildRefreshTokenCookie(familyId: string) {
    const refreshTokenValue = this.generateRefreshTokenValue();
    const hashedRefreshTokenValue = await this.hashRefreshTokenValue(refreshTokenValue);

    const refreshTokenData = await this.tokenRepository.createRefreshToken(
      hashedRefreshTokenValue,
      familyId,
    );

    // Revoke previous refresh tokens
    await this.tokenRepository.revokeAllRefreshTokensInFamilyExcept(refreshTokenData.family_id, [
      refreshTokenData.id,
    ]);

    return `${refreshTokenData.id}.${hashedRefreshTokenValue}`;
  }

  private generateRefreshTokenValue() {
    const token = randomBytes(32).toString("hex");
    return token;
  }

  private async generateAccessToken(userId: string) {
    const payload = { sub: userId };

    const token = await this.jwtService.signAsync(payload);

    return token;
  }

  private async hashRefreshTokenValue(refreshTokenValue: string) {
    const hashedToken = await hash(refreshTokenValue, SALT_ROUNDS);
    return hashedToken;
  }
}
