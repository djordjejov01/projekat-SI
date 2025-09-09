namespace Backend.Models.Dto
{
public sealed record ForgotPasswordDto(string Email);
public sealed record ResetPasswordDto(string Token, string NewPassword);
}
