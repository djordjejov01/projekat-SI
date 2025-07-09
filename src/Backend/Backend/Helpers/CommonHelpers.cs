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
    }
}
