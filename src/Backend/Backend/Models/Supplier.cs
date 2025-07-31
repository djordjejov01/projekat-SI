using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Supplier
    {
        [Key, ForeignKey(nameof(User))]
        public int Id { get; set; }
        [Required]
        public string Username { get; set; }
        [Required]
        public string CompanyName { get; set; }
        [Required]
        public string Email { get; set; }
        [Required]
        public string PhoneNumber { get; set; }
        public string Website { get; set; }
        public string CompanyBio { get; set; }
        public string Image { get; set; }
    }
}
