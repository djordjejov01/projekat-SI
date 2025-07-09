using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class TicketValidDay
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [ForeignKey(nameof(Ticket))]
        public int TicketID { get; set; }
        public Ticket Ticket { get; set; }

        public DateTime ValidDay { get; set; }
    }
}
