export class ResetPasswordDto {
  token: string;
  newPassword: string;

  constructor(token: string, newPassword: string) {
    this.token = token;
    this.newPassword = newPassword;
  }
}