using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models.Dto
{
    public class EventPinDto
    {
        public int Id { get; set; }
        public int EventId { get; set; }

        public double Latitude { get; set; }
        public double Longitude { get; set; }

        public string Label { get; set; }
        public string? Description { get; set; }

        public DateTime PinnedAt { get; set; }

        public PinTypes PinCategory { get; set; }
    }
}
