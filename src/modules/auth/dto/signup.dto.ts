import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === "string" ? value.toLowerCase().trim() : ""))
  email: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : ""))
  @MinLength(8)
  @Matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@.#$!%*?&_-]).*$")
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  name: string;
}
