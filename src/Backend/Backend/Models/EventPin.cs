using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class EventPin
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [ForeignKey(nameof(Event))]
        public int EventId { get; set; }
        
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        
        public string Label { get; set; }
        public string? Description { get; set; }

        public DateTime PinnedAt { get; set; }
                
    }
}
