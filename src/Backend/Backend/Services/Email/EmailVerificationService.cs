namespace Backend.Services.Email
{
    using Backend.Models;
    using global::Backend.Models;
    using Microsoft.EntityFrameworkCore;

    public interface IEmailVerificationService
    {
        Task SendVerificationAsync(User user, CancellationToken ct = default);
        Task<(bool ok, string message)> VerifyAsync(Guid tokenId, CancellationToken ct = default);
    }

    public sealed class EmailVerificationService(
        AppDbContext db,
        IEmailSender email,
        ILogger<EmailVerificationService> log,
        IConfiguration config,
        Microsoft.Extensions.Localization.IStringLocalizer<SharedResource> localizer
    ) : IEmailVerificationService
    {
        public async Task SendVerificationAsync(User user, CancellationToken ct = default)
        {
            // optional: throttle resends (e.g., 1 per 5 minutes)
            var lastUnconsumed = await db.EmailVerificationTokens
                .Where(t => t.UserId == user.UserId && t.Purpose == "email-verify" && t.ConsumedAtUtc == null)
                .OrderByDescending(t => t.CreatedAtUtc)
                .FirstOrDefaultAsync(ct);

            var ttlHours = config.GetValue<int>("Auth:EmailVerification:TokenTtlHours", 24);
            var token = new EmailVerificationToken
            {
                UserId = user.UserId,
                ExpiresAtUtc = DateTime.UtcNow.AddHours(ttlHours)
            };

            db.EmailVerificationTokens.Add(token);
            await db.SaveChangesAsync(ct);

            var baseUrl = config["App:PublicBaseUrl"]!.TrimEnd('/');
            var verifyUrl = $"{baseUrl}/auth/verify-email?token={token.Id:N}";

            var html = $@"
<h2>Verify your email</h2>
<p>Hi {(user.Username ?? "there")}, click the button below to verify your email address.</p>
<p><a href=""{verifyUrl}"" style=""display:inline-block;padding:10px 16px;text-decoration:none;border-radius:6px;border:1px solid #ccc"">Verify Email</a></p>
<p>If you didn’t request this, you can ignore this email.</p>
";

            await email.SendAsync(new EmailMessage
            {
                To = { new EmailAddress(user.Email, user.Username) },
                Subject = "Confirm your email",
                HtmlBody = html,
                TextBody = $"Verify your email: {verifyUrl}"
            }, ct);

            log.LogInformation("Sent verification email to user {UserId}", user.UserId);
        }

        public async Task<(bool ok, string message)> VerifyAsync(Guid tokenId, CancellationToken ct = default)
        {
            var token = await db.EmailVerificationTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Id == tokenId, ct);

            if (token is null) return (false, localizer["email_verification.token_not_found"]);
            if (token.ConsumedAtUtc is not null) return (false, localizer["email_verification.token_used"]);
            if (DateTime.UtcNow > token.ExpiresAtUtc) return (false, localizer["email_verification.token_expired"]);

            // idempotent: if already verified, still consume and return ok
            token.User.IsEmailVerified = true;
            token.ConsumedAtUtc = DateTime.UtcNow;

            // (optional) consume any other active tokens for this purpose
            var others = await db.EmailVerificationTokens
                .Where(t => t.UserId == token.UserId && t.Purpose == "email-verify" && t.ConsumedAtUtc == null && t.Id != token.Id)
                .ToListAsync(ct);
            foreach (var o in others) o.ConsumedAtUtc = DateTime.UtcNow;

            await db.SaveChangesAsync(ct);
            return (true, localizer["email_verification.verified"]);
        }
    }

}
