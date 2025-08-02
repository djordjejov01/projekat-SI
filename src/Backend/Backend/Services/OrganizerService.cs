using Backend.Helpers;
using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
                .Where(e => e.OrganizerID == id && e.ParentEventId == 0).ToList();
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
                .Where(e => e.OrganizerID == id && e.ParentEventId == 0).ToList();
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
            bool isFree = model.Tickets == null || !model.Tickets.Any() || model.Tickets.All(t => t.Price == 0);
            var newEvent = new Event
            {
                Title = model.Title,
                Description = model.Description,
                Location = model.Location,
                StartDate = model.StartDateTime,
                EndDate = model.EndDateTime,
                NumberOfPeople = model.Capacity,
                ImageUrl = imageName ?? "images/default-image.png",
                OrganizerID = organizerID,
                Category = model.Category,
                Status = EventStatus.Draft,
                ParentEventId = model.ParentEventId,
                isFree = isFree
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
            catch(Exception)
            {
                throw;
            }
        }

        public async Task DeleteEvent(int eventId,int organizerId)
        {
            var eventEntity = await _context.Events
                .FirstOrDefaultAsync(e => e.EventID == eventId && e.OrganizerID == organizerId);

            if (eventEntity == null)
                throw new ArgumentException("Event not found or you don't have permission to delete it.");

            
            if (eventEntity.Status != EventStatus.Draft)
                throw new InvalidOperationException("Event can only be deleted if it's in draft status.");

            
            var activities = await _context.EventActivities
                .Where(a => a.EventID == eventId)
                .ToListAsync();
            _context.EventActivities.RemoveRange(activities);

            
            var subevents = await _context.Events
                .Where(e => e.ParentEventId == eventId)
                .ToListAsync();

            
            foreach (var subevent in subevents)
            {
                var subeventActivities = await _context.EventActivities
                    .Where(a => a.EventID == subevent.EventID)
                    .ToListAsync();
                _context.EventActivities.RemoveRange(subeventActivities);
            }

            
            _context.Events.RemoveRange(subevents);

            
            var tickets = await _context.Tickets
                .Where(t => t.EventID == eventId)
                .ToListAsync();
            _context.Tickets.RemoveRange(tickets);


            
            _context.Events.Remove(eventEntity);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task CancelEvent(int eventId,int organizerId)
        {
            if (eventId <= 0)
                throw new ArgumentException("Invalid event ID.", nameof(eventId));

            if (organizerId <= 0)
                throw new ArgumentException("Invalid organizer ID.", nameof(organizerId));


            using var transaction = await _context.Database.BeginTransactionAsync();
            try { 
                var eventEntity = await _context.Events
                       .FirstOrDefaultAsync(e => e.EventID == eventId && e.OrganizerID == organizerId);

                if (eventEntity == null)
                    throw new ArgumentException("Event not found or you don't have permission to cancel it.");

            
                if (eventEntity.Status == EventStatus.Canceled)
                    throw new InvalidOperationException("Event is already canceled.");

                if (eventEntity.Status == EventStatus.Draft)
                    throw new InvalidOperationException("Draft events should be deleted, not canceled.");

            
                if (eventEntity.StartDate <= DateTime.UtcNow)
                    throw new InvalidOperationException("Cannot cancel an event that has already started.");


                var hasPurchasedTickets = await _context.UserTickets
                    .AnyAsync(ut => ut.Ticket.EventID == eventId);

                if (hasPurchasedTickets)
                {
                    await RefundPurchasedTickets(eventId);
                }

                

                // TODO(oslobadjanje resursa)

            
                eventEntity.Status = EventStatus.Canceled;

            
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        private async Task RefundPurchasedTickets(int eventId)
        {
            
            var purchasedTickets = await _context.UserTickets
                .Include(ut => ut.Ticket)
                .Include(ut => ut.User)
                .Where(ut => ut.Ticket.EventID == eventId)
                .ToListAsync();

            foreach (var userTicket in purchasedTickets)
            {
                
                var user = await _context.Users.FindAsync(userTicket.UserID);
                if (user != null)
                {
                    user.Credit += userTicket.Ticket.Price;
                }
            }
        }

        public async Task<EventsSubeventsActivitiesDto> GetEventSubeventsActivities(int eventId)
        {
            List<Event> AllEvents = await _context.Events
                .Where(e => e.ParentEventId == eventId)
                .Select(e => new Event
                {
                    EventID = e.EventID,
                    Title = e.Title,
                    StartDate = e.StartDate,
                    EndDate = e.EndDate,
                    Location = e.Location,
                    Description = e.Description,
                    ImageUrl = e.ImageUrl,
                    ParentEventId = e.ParentEventId
                })
                .ToListAsync();
            List<Event> subevents = AllEvents
                .Where(e => e.ParentEventId != 0)
                .ToList();

            List<EventActivity> AllActivities = new List<EventActivity>();

            List<EventActivity> mainEventActivities = await _context.EventActivities
                .Where(a => a.EventID == eventId)
                .Select(a => new EventActivity
                {
                    ActivityID = a.ActivityID,
                    Description = a.Description,
                    StartTime = a.StartTime,
                    EndTime = a.EndTime,
                    Category = a.Category,
                    EventID = a.EventID,
                    Title = a.Title
                })
                .ToListAsync();
            foreach (EventActivity activity in mainEventActivities)
            {
                AllActivities.Add(activity);
            }
            foreach (Event subevent in subevents)
            {
                List<EventActivity> subeventActivities = await _context.EventActivities
                    .Where(a => a.EventID == subevent.EventID)
                    .Select(a => new EventActivity
                    {
                        ActivityID = a.ActivityID,
                        Description = a.Description,
                        StartTime = a.StartTime,
                        EndTime = a.EndTime,
                        Category = a.Category,
                        EventID = a.EventID,
                        Title = a.Title
                    })
                    .ToListAsync();
                AllActivities.AddRange(subeventActivities);
            }
            EventsSubeventsActivitiesDto EventSubeventsActivitiesDto = new EventsSubeventsActivitiesDto();
            foreach (Event e in AllEvents)
            {
                EventSubeventsActivitiesDto.EventsAndSubevents.Add(new EventDto
                {
                    EventId = e.EventID,
                    Title = e.Title,
                    StartDate = e.StartDate,
                    EndDate = e.EndDate,
                    Location = e.Location,
                    Description = e.Description,
                    ImageUrl = e.ImageUrl,
                    ParentEventId = e.ParentEventId
                });
            }
            foreach (EventActivity a in AllActivities)
            {
                EventSubeventsActivitiesDto.Activities.Add(new ActivityDto
                {
                    ActivityId = a.ActivityID,
                    EventId = a.EventID,
                    Title = a.Title,
                    StartDate = a.StartTime,
                    EndDate = a.EndTime,
                    Description = a.Description,
                    Category = a.Category
                });
            }
            return EventSubeventsActivitiesDto;
        }
        public Task CreateActivity(ActivityDto activity)
        {
            if (activity == null)
                throw new ArgumentNullException(nameof(activity), "Activity cannot be null.");

            var startUtc = DateTime.SpecifyKind(activity.StartDate, DateTimeKind.Utc);
            var endUtc = DateTime.SpecifyKind(activity.EndDate, DateTimeKind.Utc);

            EventActivity e = new EventActivity
            {
                Description = activity.Description,
                StartTime = startUtc,
                EndTime = endUtc,
                Category = activity.Category,
                EventID = activity.EventId,
                Title = activity.Title
            };

            _context.EventActivities.Add(e);
            try
            {
                return _context.SaveChangesAsync();
            }
            catch (Exception)
            {
                throw;
            }

        }
    }
}
