using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.Tracing;

namespace Backend.Models
{
    public class Resource
    {
        [Key]
        public int ResourceID { get; set; }

        [Required]
        public string Name { get; set; }
        public string Description { get; set; }

        [ForeignKey(nameof(Supplier))]
        public int SupplierID { get; set; }

        public int Quantity { get; set; }

        public User Supplier { get; set; }
    }
}
