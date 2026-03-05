import BusinessException from "common/exceptions/base.exception";

export class InvalidCredentialsException extends BusinessException {
  constructor() {
    super("INVALID_CREDENTIALS", "Invalid credentials");
  }
}

export class EmailAldreadyInUseException extends BusinessException {
  constructor() {
    super("EMAIL_ALREADY_IN_USE", "Email already in use");
  }
}
