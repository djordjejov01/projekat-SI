namespace Backend.Models.Dto
{
    public class EventDetailsDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string ImageUrl { get; set; }
        public string Location { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Description { get; set; }
        public int OrganizerId { get; set; }
        public string OrganizerName { get; set; }
        public int AttendingCount { get; set; }
        public bool IsFavorite { get; set; }
        public List<EventActivityDto> Agenda { get; set; }

        //za izvodjace?
    }
}
