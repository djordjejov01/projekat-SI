using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Ticket
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
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
        [Required]
        public DateTime validFrom { get; set; }
        [Required]
        public DateTime validUntil { get; set; }
        public Event Event { get; set; }
    }
}
