using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class EventResource
    {
        [Key]
        public int ID { get; set; }

        [ForeignKey(nameof(Supplier))]
        public int SupplierID { get; set; }

        [ForeignKey(nameof(Event))]
        public int EventID { get; set; }

        public int Quantity { get; set; }

        public string Measure { get; set; }

        public User Supplier { get; set; }
        public Event Event { get; set; }
    }
}
