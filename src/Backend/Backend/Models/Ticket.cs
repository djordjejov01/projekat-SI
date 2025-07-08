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
        [Required,MaxLength(50)]
        public string TypeName {  get; set; }
        public string Description { get; set; }
        [Required]
        public decimal Price { get; set; }
        [Required]
        public int Quota { get; set; }

        public Event Event { get; set; }
    }
}
