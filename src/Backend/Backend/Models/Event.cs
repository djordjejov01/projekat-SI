using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.Tracing;
using System.Net.Sockets;

namespace Backend.Models
{
    public class Event
    {
        [Key]
        public int EventID { get; set; }

        [ForeignKey(nameof(Organizer))]
        public int OrganizerID { get; set; }

        [Required, MaxLength(50)]
        public string Title { get; set; }

        public string Description { get; set; }
        public string Location { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int? NumberOfPeople { get; set; }
        public int TicketPrice { get; set; }
        public User Organizer { get; set; }

    }
}
