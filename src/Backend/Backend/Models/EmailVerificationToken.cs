using System;

namespace Backend.Models
{

    public class EmailVerificationToken
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public int UserId { get; set; }
        public User User { get; set; } = default!;
        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
        public DateTime ExpiresAtUtc { get; set; }
        public DateTime? ConsumedAtUtc { get; set; }
        public string Purpose { get; set; } = "email-verify"; 
    }
}
