namespace Backend.Models.Dto
{
    public class TicketValidationDto
    {
        public string Status { get; set; } // "valid" ili "invalid"
        public string Message { get; set; }
        public DateTime? UsedAt { get; set; }
    }
}
