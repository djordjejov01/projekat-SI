using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.Tracing;

namespace Backend.Models
{
    public class Resource
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ResourceID { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public ResourceCategory Category { get; set; }
        public bool IsExhaustable { get; set; }
        public ResourceAvailability IsAvailable { get; set; }
        public ResourceMeasurment? Measurment { get; set; }

        public string Description { get; set; }

        [ForeignKey(nameof(Supplier))]
        public int SupplierID { get; set; }

        public int Quantity { get; set; }

        public User Supplier { get; set; }
    }
    public enum ResourceCategory
    {
        Undefined
    }
    public enum ResourceAvailability
    {
        Available = 0,
        Unavailable = 1,
        Booked = 2
    }
    public enum ResourceMeasurment
    {
        Undefined,
        Piece,
        Kilogram,
        Liter,
        Meter,
        Hour,
        Bottle
    }
}
