import BusinessException from "common/exceptions/base.exception";

export class InvalidRefreshTokenException extends BusinessException {
  constructor() {
    super("INVALID_REFRESH_TOKEN", "Invalid refresh token");
  }
}
