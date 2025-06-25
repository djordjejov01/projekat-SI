using System.ComponentModel.DataAnnotations;

namespace Backend.Models.Dto
{
    public class RegisterDto
    {
        [Required]
        public string Username { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; }

        [Required, MinLength(8)]
        public string Password { get; set; }

        [Required, MinLength(8)]
        public string ConfirmPassword { get; set; }

        [Required]
        public string? Role { get; set; }
    }
}
