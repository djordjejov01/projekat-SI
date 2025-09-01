namespace Backend.Services.Email
{
    public sealed class EmailOptions
    {
        public SmtpOptions Smtp { get; set; } = new();
        public EmailDefaults Defaults { get; set; } = new();
    }

    public sealed class SmtpOptions
    {
        public string Host { get; set; } = "";
        public int Port { get; set; } = 587;
        public bool UseStartTls { get; set; } = true; // false -> Auto/SSL depending on port
        public string? User { get; set; }
        public string? Password { get; set; }
        public bool SkipCertificateValidation { get; set; } = false; // keep false in prod
    }

    public sealed class EmailDefaults
    {
        public string FromAddress { get; set; } = "";
        public string FromName { get; set; } = "";
    }

    // Email/EmailModels.cs
    public sealed record EmailAddress(string Address, string? Name = null);

    public sealed record EmailAttachment(byte[] Content, string FileName, string ContentType);

    public sealed class EmailMessage
    {
        public List<EmailAddress> To { get; } = new();
        public List<EmailAddress> Cc { get; } = new();
        public List<EmailAddress> Bcc { get; } = new();
        public string Subject { get; set; } = "";
        public string? HtmlBody { get; set; }
        public string? TextBody { get; set; } // optional fallback
        public EmailAddress? ReplyTo { get; set; }
        public List<EmailAttachment> Attachments { get; } = new();
        public Dictionary<string, string> Headers { get; } = new();
    }

    public interface IEmailSender
    {
        Task SendAsync(EmailMessage message, CancellationToken ct = default);
    }

}
