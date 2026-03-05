import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

const Cookies = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request: Request = ctx.switchToHttp().getRequest();

  const cookies: Record<string, string> = request.cookies;

  return data ? (cookies?.[data] ?? null) : cookies;
});

export default Cookies;
