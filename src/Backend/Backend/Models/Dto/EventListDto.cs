namespace Backend.Models.Dto
{
    public class EventListDto
    {
        public int Id { get; set; }
        public string Title {  get; set; }
        public string Location { get; set; }
        public DateTime StartDate { get; set; }
        public string ImageUrl { get; set; }
        public int AttendingCount { get; set; }
    }
}
