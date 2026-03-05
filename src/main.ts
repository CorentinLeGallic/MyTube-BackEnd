import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import { GlobalExceptionFilter } from "common/exceptions/global-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["log", "error", "warn"],
  });

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>("PORT");

  await app.listen(port ?? 8000, "0.0.0.0");
}

void bootstrap();
