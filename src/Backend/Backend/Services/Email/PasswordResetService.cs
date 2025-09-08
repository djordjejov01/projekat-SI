using Backend.Helpers;
using Backend.Models;
using Backend.Utils;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.Email
{
    public interface IPasswordResetService
    {
        Task RequestAsync(string email, CancellationToken ct = default);
        Task<(bool ok, string message)> ResetAsync(Guid tokenId, string newPassword, CancellationToken ct = default);
    }

    public sealed class PasswordResetService(
        AppDbContext db,
        IEmailSender emailSender,
        IConfiguration cfg,
        ILogger<PasswordResetService> log
    ) : IPasswordResetService
    {
        public async Task RequestAsync(string email, CancellationToken ct = default)
        {
            var user = db.Users.Where(u => u.Email == email).FirstOrDefault();
            if (user is null) { await Task.CompletedTask; return; }

            // throttle resends
            var cooldownMin = cfg.GetValue("Auth:PasswordReset:ResendCooldownMinutes", 5);
            var last = db.EmailVerificationTokens
                .Where(t => t.UserId == user.UserId && t.Purpose == TokenPurposes.PasswordReset && t.ConsumedAtUtc == null)
                .OrderByDescending(t => t.CreatedAtUtc)
                .FirstOrDefaultAsync(ct);

            if (last is null) // || (DateTime.UtcNow - last.) > TimeSpan.FromMinutes(cooldownMin)
            {
                var ttlMin = cfg.GetValue("Auth:PasswordReset:TokenTtlMinutes", 30);
                var token = new EmailVerificationToken
                {
                    UserId = user.UserId,
                    ExpiresAtUtc = DateTime.UtcNow.AddMinutes(ttlMin),
                    Purpose = TokenPurposes.PasswordReset
                };
                db.EmailVerificationTokens.Add(token);
                await db.SaveChangesAsync(ct);

                var frontendUrlTemplate = cfg["App:Frontend:ResetPasswordPageUrl"]!.Trim();
                var resetUrl = frontendUrlTemplate.Replace("{token}", token.Id.ToString("N"));

                var html = $@"
                    <h2>Reset your password</h2>
                    <p>Hello {(user.Username ?? "there")}, click the button below to reset your password.</p>
                    <p><a href=""{resetUrl}"" style=""display:inline-block;padding:10px 16px;border:1px solid #ccc;border-radius:6px;text-decoration:none"">Reset Password</a></p>
                    <p>If you didn’t request this, you can ignore this email.</p>";

                await emailSender.SendAsync(new EmailMessage
                {
                    To = { new EmailAddress(user.Email, user.Username) },
                    Subject = "Password reset",
                    HtmlBody = html,
                    TextBody = $"Reset your password: {resetUrl}"
                }, ct);

                log.LogInformation("Password reset email sent to user {UserId}", user.UserId);
            }
        }

        public async Task<(bool ok, string message)> ResetAsync(Guid tokenId, string newPassword, CancellationToken ct = default)
        {
            // Basic password rules (adjust as needed)
            if (!CommonHelpers.IsPasswordStrong(newPassword))
                return (false, "Password does not meet complexity requirements.");

            var token = await db.EmailVerificationTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Id == tokenId, ct);

            if (token is null) return (false, "Invalid token.");
            if (token.Purpose != TokenPurposes.PasswordReset) return (false, "Invalid token purpose.");
            if (token.ConsumedAtUtc is not null) return (false, "Token already used.");
            if (DateTime.UtcNow > token.ExpiresAtUtc) return (false, "Token expired.");

            token.User.Password = CommonHelpers.HashPassword(newPassword);
            token.ConsumedAtUtc = DateTime.UtcNow;

            var others = await db.EmailVerificationTokens
                .Where(t => t.UserId == token.UserId && t.Purpose == TokenPurposes.PasswordReset && t.ConsumedAtUtc == null && t.Id != token.Id)
                .ToListAsync(ct);
            foreach (var o in others) o.ConsumedAtUtc = DateTime.UtcNow;

            await db.SaveChangesAsync(ct);
            return (true, "Password updated.");
        }
    }
}
