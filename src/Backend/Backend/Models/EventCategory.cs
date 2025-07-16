using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{

    public enum EventCategory
    {
        Music,
        Sports,
        Entertainment,
        Protest,
        Charity,
        Business,
        Culture,
        Other
    }

    public class EventCategories
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CategoryID { get; set; }
        public EventCategory CategoryName { get; set; }

    }
}
