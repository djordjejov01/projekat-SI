namespace Backend.Models.Dto
{
    public class EventBasicInfoDto
    {
        public int EventID { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Location { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public EventCategory Category { get; set; }
        public int? Capacity { get; set; }
        public int AttendingCount { get; set; }
        public string ImageUrl { get; set; }
        public EventStatus status { get; set; }
        public int ParentEventId { get; set; }
    }
}
