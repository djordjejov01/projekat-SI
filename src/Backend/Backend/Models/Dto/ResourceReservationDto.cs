namespace Backend.Models.Dto
{
    public class ResourceReservationDto
    {
        public int UserID { get; set; }
        public int EventResourceID { get; set; }
        public int Quantity { get; set; }
        public int? UserTicketID { get; set; }
    }
}
