using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Organizer
    {
        [Key, ForeignKey(nameof(User))]
        public int Id { get; set; }
        [Required, MaxLength(50)]
        public string Name { get; set; }
        
        [Required, MaxLength(50)]
        public string Username { get; set; }
        
        [Required, MaxLength(50)]
        public string Email { get; set; }
        
        [Required, MaxLength(50)]
        public string PhoneNumber { get; set; }
        [MaxLength(100)]
        public string Image {  get; set; }

    }
}
