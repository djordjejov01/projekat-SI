using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.Tracing;
using System.Net.Sockets;

namespace Backend.Models
{
    public class Event
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int EventID { get; set; }

        [ForeignKey(nameof(Organizer))]
        public int OrganizerID { get; set; }

        [Required, MaxLength(50)]
        public string Title { get; set; }

        [Required]
        public EventCategory Category { get; set; }

        public string Description { get; set; }
        public string Location { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int? NumberOfPeople { get; set; }
        public User Organizer { get; set; }
        public string ImageUrl { get; set; }
        public bool isFree { get; set; }
        public EventStatus Status { get; set; }
        public DateTime? PublishedAt { get; set; }
        public int ParentEventId { get; set; } = 0;
    }

    public enum EventStatus
    {
        Draft,
        Published,
        Canceled,
        Finished
    }

}
