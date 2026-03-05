import { IS_PUBLIC_KEY } from "@constants/decorators.constants";
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

interface JwtPayload {
  sub: string;
}

interface RequestWithJwt extends Request {
  user: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // Check if the isPublic metadata has been set on the route handler
      context.getClass(), // Check if the isPublic metadata has been set on the controller class
    ]);

    if (isPublic) return true;

    const request: RequestWithJwt = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) throw new UnauthorizedException();

    try {
      const payload: JwtPayload = await this.jwtService.verifyAsync(token);

      request.user = payload.sub;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];

    return type === "Bearer" ? token : undefined;
  }
}
