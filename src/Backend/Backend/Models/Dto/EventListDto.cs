using System.Text.Json.Serialization;

namespace Backend.Models.Dto
{
    public class EventListDto
    {
        public int Id { get; set; }
        public string Title {  get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public EventCategory Category { get; set; }
        public string Location { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string ImageUrl { get; set; }
        public int AttendingCount { get; set; }
        public int ParentEventId { get; set; }
    }
}
