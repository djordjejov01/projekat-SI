using System.ComponentModel.DataAnnotations;

namespace Backend.Models.Dto
{
    public class CreateEventDto
    {
        [Required]
        public string Title { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        public string Location { get; set; }

        [Required]
        public DateTime StartDateTime { get; set; }

        [Required]
        public DateTime EndDateTime { get; set; }
        [Required]
        public EventCategory Category { get; set; }

        [Required]
        public int Capacity { get; set; }

        public string Image { get; set; }
        public IFormFile imageFile { get; set; }

        public List<TicketDto> Tickets { get; set; }
    }
    public class TicketDto
    {
        [Required]
        public string Name { get; set; }

        [Required]
        public decimal Price { get; set; }
        [Required]
        public DateTime validFrom { get; set; }
        [Required]
        public DateTime validUntil { get; set; }
        [Required]
        public int Quota { get; set; }

        [Required]
        public string Description { get; set; }
    }
}

