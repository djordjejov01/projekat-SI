using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class UserTicket
    {
        [Key]
        public int UserTicketID { get; set; }

        [ForeignKey(nameof(User))]
        public int UserID { get; set; }

        [ForeignKey(nameof(Ticket))]
        public int TicketID { get; set; }

        public DateTime PurchasedAt { get; set; }

        public User User { get; set; }
        public Ticket Ticket { get; set; }
    }
}
