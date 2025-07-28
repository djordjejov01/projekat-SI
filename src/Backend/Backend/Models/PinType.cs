using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public enum PinTypes
    {
        Booth,
        Stage,
        Entrance,
        Exit,
        FirstAid,
        Food,
        Drink,
        Restroom,
        Info,
        Security,
        Parking,
        LostAndFound,
    }
    public class PinType
    {
        [Key]
        public int PinTypeId { get; set; }
        public string PinCategory { get; set; }
    }
}
