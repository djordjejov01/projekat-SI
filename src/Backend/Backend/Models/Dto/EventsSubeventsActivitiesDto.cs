namespace Backend.Models.Dto
{
    public class EventsSubeventsActivitiesDto
    {
        public List<EventDto> EventsAndSubevents { get; set; } = new List<EventDto>();
        public List<ActivityDto> Activities { get; set; } = new List<ActivityDto>();
    }
    public class EventDto
    {
        public int EventId { get; set; }
        public string Title { get; set; }
        public string Location { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string ImageUrl { get; set; }
        public int ParentEventId { get; set; }
        public string Description { get; set; }
    }
    public class ActivityDto
    {
        public int ActivityId { get; set; }
        public int EventId { get; set; }
        public string Title { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Description { get; set; }
    }
}
