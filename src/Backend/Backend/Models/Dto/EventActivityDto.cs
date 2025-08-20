using System.Text.Json.Serialization;

namespace Backend.Models.Dto
{
    public class EventActivityDto
    {
        public string Title { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public EventCategory Category { get; set; }
        public string Description { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
    }
}
