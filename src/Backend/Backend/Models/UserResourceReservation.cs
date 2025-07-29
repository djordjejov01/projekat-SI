using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class UserResourceReservation
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [ForeignKey(nameof(User))]
        public int UserID { get; set; }
        public User User { get; set; }

        [ForeignKey(nameof(EventResource))]
        public int EventResourceID { get; set; }
        public EventResource EventResource { get; set; }

        [ForeignKey(nameof(UserTicket))]
        public int? UserTicketID { get; set; }
        public UserTicket UserTicket { get; set; }

        [Required]
        public int Quantity { get; set; }

        public DateTime ReservedAt { get; set; }
    }
}
