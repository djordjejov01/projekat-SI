using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Services
{
    public class OrganizerService : IOrganizerService
    {
        private readonly AppDbContext _context;

        public OrganizerService(AppDbContext context)
        {
            _context = context;
        }
        public List<Event> GetEventsForOrganier(int id)
        {
            var now = DateTime.Now;
            var events = _context.Events
                .Where(e => e.OrganizerID == id).ToList();
            if (events == null || !events.Any())
            {
                throw new Exception("No events found for this organizer.");
            }
            List<Event> upcoming = events.Where(e => e.StartDate >= now).OrderBy(e => e.StartDate).ToList();
            return upcoming;

        }
        public Task CreateEventForOrganizer(CreateEventDto model, int organizerID)
        {
            if (model == null)
            {
                throw new ArgumentNullException(nameof(model), "Event model cannot be null.");
            }
            if (organizerID <= 0)
            {
                throw new ArgumentException("Invalid organizer ID.", nameof(organizerID));
            }
            var newEvent = new Event
            {
                Title = model.Title,
                Description = model.Description,
                Location = model.Location,
                StartDate = model.StartDateTime,
                EndDate = model.EndDateTime,
                NumberOfPeople = model.Capacity,
                ImageUrl = model.Image,
                OrganizerID = organizerID
            };
            _context.Events.Add(newEvent);
            try
            {
                 _context.SaveChanges();
            }
            catch(Exception ex)
            {
                throw ex;
            }
            int eventId = newEvent.EventID;
            if (model.Tickets != null && model.Tickets.Any())
            {
                foreach (var ticket in model.Tickets)
                {
                    var newTicket = new Ticket
                    {
                        TypeName = ticket.Name,
                        Price = ticket.Price,
                        EventID = eventId,
                        Quota = 0,
                        Description = "",
                        //Missing info for valid days
                        
                    };
                    _context.Tickets.Add(newTicket);
                }
            }
            try
            {
                _context.SaveChanges();
            }
            catch(Exception ex)
            {
                throw ex;
            }
            return Task.CompletedTask;
        }
    }
}
