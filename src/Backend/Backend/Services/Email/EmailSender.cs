namespace Backend.Services.Email
{
    // Email/MailKitEmailSender.cs
    using MailKit.Net.Smtp;
    using MailKit.Security;
    using Microsoft.Extensions.Options;
    using MimeKit;
    using MimeKit.Text;
    using Polly;
    using Polly.Retry;
    public sealed class MailKitEmailSender : IEmailSender
    {
        private readonly EmailOptions _options;
        private readonly ILogger<MailKitEmailSender> _logger;
        private readonly AsyncRetryPolicy _retryPolicy;

        public MailKitEmailSender(IOptions<EmailOptions> options, ILogger<MailKitEmailSender> logger)
        {
            _options = options.Value;
            _logger = logger;

            _retryPolicy = Policy
                .Handle<IOException>()
                .Or<MailKit.ServiceNotConnectedException>()
                .Or<MailKit.ServiceNotAuthenticatedException>()
                .Or<MailKit.ProtocolException>()
                .WaitAndRetryAsync(
                    retryCount: 3,
                    sleepDurationProvider: attempt => TimeSpan.FromSeconds(Math.Pow(2, attempt)), // 2s, 4s, 8s
                    onRetry: (ex, delay, attempt, _) =>
                        _logger.LogWarning(ex, "Email send retry {Attempt} after {Delay}", attempt, delay));
        }

        public async Task SendAsync(EmailMessage message, CancellationToken ct = default)
        {
            if (message.To.Count == 0) throw new ArgumentException("At least one recipient is required.", nameof(message));

            var mime = BuildMimeMessage(message);

            await _retryPolicy.ExecuteAsync(async token =>
            {
                using var client = new SmtpClient();

                if (_options.Smtp.SkipCertificateValidation)
                    client.ServerCertificateValidationCallback = (_, _, _, _) => true;

                var secure = _options.Smtp.UseStartTls
                    ? SecureSocketOptions.StartTls
                    : (_options.Smtp.Port == 465 ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.Auto);

                await client.ConnectAsync(_options.Smtp.Host, _options.Smtp.Port, secure, token);

                if (!string.IsNullOrWhiteSpace(_options.Smtp.User))
                    await client.AuthenticateAsync(_options.Smtp.User, _options.Smtp.Password, token);

                await client.SendAsync(mime, token);
                await client.DisconnectAsync(true, token);

            }, ct);
        }

        private MimeMessage BuildMimeMessage(EmailMessage msg)
        {
            var mime = new MimeMessage();

            mime.From.Add(new MailboxAddress(_options.Defaults.FromName, _options.Defaults.FromAddress));

            foreach (var r in msg.To) mime.To.Add(new MailboxAddress(r.Name ?? r.Address, r.Address));
            foreach (var r in msg.Cc) mime.Cc.Add(new MailboxAddress(r.Name ?? r.Address, r.Address));
            foreach (var r in msg.Bcc) mime.Bcc.Add(new MailboxAddress(r.Name ?? r.Address, r.Address));

            if (msg.ReplyTo is not null)
                mime.ReplyTo.Add(new MailboxAddress(msg.ReplyTo.Name ?? msg.ReplyTo.Address, msg.ReplyTo.Address));

            foreach (var kv in msg.Headers)
                mime.Headers.Add(kv.Key, kv.Value);

            mime.Subject = msg.Subject;

            var body = new BodyBuilder
            {
                HtmlBody = msg.HtmlBody,
                TextBody = msg.TextBody ?? (msg.HtmlBody is null ? "" : null)
            };

            foreach (var a in msg.Attachments)
                body.Attachments.Add(a.FileName, a.Content, ContentType.Parse(a.ContentType));

            mime.Body = body.ToMessageBody();
            return mime;
        }
    }

}
