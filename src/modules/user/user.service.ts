import { Injectable } from "@nestjs/common";
import { compare, hash } from "bcrypt";
import { UserRepository } from "./user.repository";
import { User } from "generated/prisma/client";

const SALT_ROUNDS = 10;

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async create(email: string, password: string, name: string) {
    const hashedPassword = await hash(password, SALT_ROUNDS);

    return this.userRepository.create({
      email,
      hashedPassword,
      name,
    });
  }

  async isEmailTaken(email: string) {
    const emailCount = await this.userRepository.countByEmail(email);
    return emailCount > 0;
  }

  async isPasswordValid(user: User, password: string) {
    return compare(password, user.hashed_password);
  }
}
