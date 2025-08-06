using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace Backend.Helpers
{
    public static class CommonHelpers
    {
        public static bool IsEmailInValidForm(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return false;
            const string allowed = @"A-Za-z0-9!#$%&'*+/=?^_`{|}~\-";
            var pattern = $@"^[{allowed}]{{3,}}@[{allowed}]{{2,}}\.[{allowed}]{{2,}}$";

            return Regex.IsMatch(email, pattern);
        }

        public static bool IsPhoneNumberValid(string phoneNumber)
        {
            if (string.IsNullOrWhiteSpace(phoneNumber))
                return false;
            var pattern = @"^(?:\+3816\d{8}|06\d{8})$";
            return Regex.IsMatch(phoneNumber, pattern);
        }

        public static bool IsPasswordStrong(string password)
        {
            if (string.IsNullOrEmpty(password) || password.Length < 8)
                return false;
            if (!password.Any(char.IsUpper))
                return false;
            if (!password.Any(char.IsLower))
                return false;
            if (!password.Any(char.IsDigit))
                return false;
            return true;
        }

        public static string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = Encoding.UTF8.GetBytes(password);
                var hash = sha256.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }
        public static async Task<string> SaveImageAsync(IFormFile file, IWebHostEnvironment env)
        {
            var imagesPath = Path.Combine(env.WebRootPath, "images");
            Directory.CreateDirectory(imagesPath);

            var uniqueName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var fullPath = Path.Combine(imagesPath, uniqueName);

            await using var fs = new FileStream(fullPath, FileMode.Create);
            await file.CopyToAsync(fs);

            // store only the relative path or just "images/{uniqueName}" in DB
            return $"images/{uniqueName}";
        }
        public static Task RemovePhoto(string storedPath, IWebHostEnvironment env)
        {
            if (string.IsNullOrWhiteSpace(storedPath))
                return Task.CompletedTask;

            storedPath = storedPath
                .Replace('\\', Path.DirectorySeparatorChar)
                .Replace('/', Path.DirectorySeparatorChar)
                .TrimStart(Path.DirectorySeparatorChar);
            var fullPath = Path.Combine(env.WebRootPath, storedPath);
            var webRootFull = Path.GetFullPath(env.WebRootPath);
            var candidate = Path.GetFullPath(fullPath);
            if (!candidate.StartsWith(webRootFull, System.StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("Attempt to delete a file outside wwwroot.");

            if (File.Exists(candidate))
            {
                File.Delete(candidate);
            }

            return Task.CompletedTask;
        }

        public static string GenerateValidationToken()
        {
            return Guid.NewGuid().ToString("N");
        }
    }
}
