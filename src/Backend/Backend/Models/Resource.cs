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

        public string Description { get; set; }

        [ForeignKey(nameof(Supplier))]
        public int SupplierID { get; set; }

        public int Quantity { get; set; }

        public User Supplier { get; set; }
    }
    public enum ResourceCategory
    {
        Undefined = 0,
        Equipment = 1,        // e.g. Speakers, Lights, Projectors
        Furniture = 2,        // e.g. Chairs, Tables, Stages
        Electrical = 3,       // e.g. Extension cords, Generators
        Sanitation = 4,       // e.g. Toilets, Trash bins, Hand sanitizers
        FoodAndBeverage = 5,  // e.g. Food trucks, Water bottles
        Medical = 6,          // e.g. First aid kits, Ambulances
        Security = 7,         // e.g. Barricades, Uniforms, Radios
        Merchandise = 8,      // e.g. Stands, Posters, Souvenirs
        Transportation = 9,   // e.g. Vans, Golf carts
        Technology = 10       // e.g. Laptops, Wi-Fi routers, Tablets
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
