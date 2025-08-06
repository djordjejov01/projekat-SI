using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class UserTicket
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UserTicketID { get; set; }

        [ForeignKey(nameof(User))]
        public int UserID { get; set; }

        [ForeignKey(nameof(Ticket))]
        public int TicketID { get; set; }

        public DateTime PurchasedAt { get; set; }

        public bool IsUsed { get; set; } = false;
        public DateTime? UsedAt { get; set; }
        public string ValidationToken { get; set; }

        public User User { get; set; }
        public Ticket Ticket { get; set; }
    }
}
