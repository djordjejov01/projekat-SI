using Backend.Helpers;
using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Services
{
    public class OrganizerService : IOrganizerService
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public OrganizerService(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }
        public List<Event> GetUpcomingEventsForOrganier(int id)
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
        public List<Event> GetAllEventsForOrganier(int id)
        {
            var now = DateTime.Now;
            var events = _context.Events
                .Where(e => e.OrganizerID == id).ToList();
            if (events == null || !events.Any())
            {
                throw new Exception("No events found for this organizer.");
            }
            return events;
        }
        public async Task CreateEventForOrganizer(CreateEventDto model, int organizerID)
        {
            if (model == null)
            {
                throw new ArgumentNullException(nameof(model), "Event model cannot be null.");
            }
            if (organizerID <= 0)
            {
                throw new ArgumentException("Invalid organizer ID.", nameof(organizerID));
            }
            string imageName = null;
            if (model.ImageFile != null)
            {
                imageName = await CommonHelpers.SaveImageAsync(model.ImageFile, _env);
            }

            var newEvent = new Event
            {
                Title = model.Title,
                Description = model.Description,
                Location = model.Location,
                StartDate = model.StartDateTime,
                EndDate = model.EndDateTime,
                NumberOfPeople = model.Capacity,
                ImageUrl = imageName ?? "default-image.jpg",
                OrganizerID = organizerID,
                Category = model.Category
            };
            _context.Events.Add(newEvent);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception)
            {
                throw;
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
                        Quota = ticket.Quota,
                        Description = ticket.Description,
                        validFrom = ticket.ValidFrom,
                        validUntil = ticket.ValidUntil

                        //Missing info for valid days

                    };
                    _context.Tickets.Add(newTicket);
                }
            }
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}
