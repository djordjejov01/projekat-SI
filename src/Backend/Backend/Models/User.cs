using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("Users")]
    public class User
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UserId { get; set; }

        [Required, MaxLength(50)]
        public string Username { get; set; }

        [Required, MaxLength(50)]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }

        [Required, MaxLength(50)]
        public string FirstName { get; set; }

        [Required, MaxLength(50)]
        public string LastName { get; set; }

        [Required]
        public UserRole Role { get; set; } 

        public DateTime CreationTime { get; set; } = DateTime.UtcNow;
        public DateTime? LastLoginTime { get; set; }

        public string ProfilePicture { get; set; }
        public string Language { get; set; }
        public string PhoneNumber { get; set; }
        public bool IsActive { get; set; }
        public decimal Credit { get; set; }
        public bool IsEmailVerified { get; set; } = false;
    }
}