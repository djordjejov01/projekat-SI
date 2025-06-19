using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace crud.api.Model
{
    [Table("UserTbl")]
    public class UserModel
    {
        [Key,DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int userId { get; set; }
        [Required]
        public string email {  get; set; }=string.Empty;
        [Required]
        public string mobile { get; set; } = string.Empty; 
        [Required]
        public string city { get; set; } = string.Empty;
        public string state { get; set; } = string.Empty;
        [Required]
        public string address { get; set; } = string.Empty;

    }
}
