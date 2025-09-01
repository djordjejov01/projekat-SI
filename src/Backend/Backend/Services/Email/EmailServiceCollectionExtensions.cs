namespace Backend.Services.Email
{
    public static class EmailServiceCollectionExtensions
    {
        public static IServiceCollection AddEmail(this IServiceCollection services, IConfiguration config)
        {
            services.Configure<EmailOptions>(config.GetSection("Email"));
            services.AddSingleton<IEmailSender, MailKitEmailSender>();
            return services;
        }
    }
}
