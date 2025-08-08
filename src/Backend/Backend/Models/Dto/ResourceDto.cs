using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models.Dto
{
    public class ResourceDto
    {
        public int ResourceID { get; set; }
        public string Name { get; set; }
        public ResourceCategory Category { get; set; }
        public bool IsExhaustable { get; set; }
        public ResourceAvailability IsAvailable { get; set; }
        public string Description { get; set; }
        public int SupplierID { get; set; }
        public int Quantity { get; set; }
        public User Supplier { get; set; }
    }
}
