using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class EventActivity
    {
        [Key]
        public int ActivityID { get; set; }

        [ForeignKey(nameof(Event))]
        public int EventID { get; set; }

        [Required, MaxLength(50)]
        public string Title { get; set; }

        public string Description { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

    }
}
