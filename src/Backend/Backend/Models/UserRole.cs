using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public enum UserRole
    {
        Admin,
        Organizer,
        Supplier,
        Guest
    }

    public class UserRoles
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RoleId { get; set; }
        public UserRole RoleName { get; set; }
    }

}
