using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class ResourceLog
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int LogID { get; set; }
        public int ResourceID { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public ResourceCategory Category { get; set; }
        public bool IsExhaustable { get; set; }
        public ResourceAvailability IsAvailable { get; set; }

        public string Description { get; set; }

        [ForeignKey(nameof(Supplier))]
        public int SupplierID { get; set; }

        public int Quantity { get; set; }
        public DateTime LogDate { get; set; }
    }
}
