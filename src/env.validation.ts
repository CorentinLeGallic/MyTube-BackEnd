import { plainToInstance, Transform } from "class-transformer";
import { IsString, IsNumber, validateSync, IsNotEmpty } from "class-validator";

class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsNumber()
  REFRESH_TOKEN_LIFETIME_DAYS: number;

  @IsNumber()
  ACCESS_TOKEN_LIFETIME_MINUTES: number;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === "string" ? value.replace(/\\n/g, "\n") : ""))
  JWT_PRIVATE_KEY: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === "string" ? value.replace(/\\n/g, "\n") : ""))
  JWT_PUBLIC_KEY: string;

  @IsNumber()
  PORT: number;
}

export default function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) throw new Error(errors.toString());

  return validatedConfig;
}
