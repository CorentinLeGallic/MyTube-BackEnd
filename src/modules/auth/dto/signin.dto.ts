import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SignInDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === "string" ? value.toLowerCase().trim() : ""))
  email: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : ""))
  password: string;
}
