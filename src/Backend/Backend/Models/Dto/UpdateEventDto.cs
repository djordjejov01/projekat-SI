namespace Backend.Models.Dto
{
    public class UpdateEventDto
    {
        public int EventId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Location { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public EventCategory Category { get; set; }
        public int Capacity { get; set; }
    }
}
