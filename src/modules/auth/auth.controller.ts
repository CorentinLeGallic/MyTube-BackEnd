import { Body, Controller, HttpCode, Post, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignUpDto } from "./dto/signup.dto";
import type { Request, Response } from "express";
import { SignInDto } from "./dto/signin.dto";
import Public from "@decorators/public.decorator";
import Cookies from "@decorators/cookies.decorator";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  @Public()
  @HttpCode(200)
  async signUp(@Body() body: SignUpDto, @Res({ passthrough: true }) res: Response) {
    const { email, password, name } = body;

    const { refreshToken, accessToken } = await this.authService.signUp(email, password, name);

    this.setRefreshTokenCookie(res, refreshToken);

    return accessToken;
  }

  @Post("signin")
  @Public()
  @HttpCode(200)
  async signIn(@Body() body: SignInDto, @Res({ passthrough: true }) res: Response) {
    const { email, password } = body;

    const { refreshToken, accessToken } = await this.authService.signIn(email, password);

    this.setRefreshTokenCookie(res, refreshToken);

    return accessToken;
  }

  @Post("refresh")
  @Public()
  @HttpCode(200)
  async refresh(
    @Cookies("token") refreshTokenCookie: string | null,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken: newRefreshToken, accessToken: newAccessToken } =
      await this.authService.refresh(refreshTokenCookie);

    this.setRefreshTokenCookie(res, newRefreshToken);

    return newAccessToken;
  }

  @Post("logout")
  @HttpCode(200)
  async logOut(
    @Cookies("token") refreshTokenCookie: string | null,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.clearRefreshTokenCookie(res);
    await this.authService.logOut(refreshTokenCookie);
  }

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie("token", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
    });
  }

  private clearRefreshTokenCookie(res: Response) {
    res.clearCookie("token");
  }
}
