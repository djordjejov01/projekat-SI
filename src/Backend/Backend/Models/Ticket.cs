using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Ticket
    {
        [Key]
        public int TicketID { get; set; }

        [ForeignKey(nameof(Event))]
        public int EventID { get; set; }

        public int Price { get; set; }
        public int Quantity { get; set; }

        public Event Event { get; set; }
    }
}
