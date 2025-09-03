using Backend.Helpers;
using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Services
{
    public class OrganizerService : IOrganizerService
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly IStringLocalizer<SharedResource> _localizer;

        public OrganizerService(AppDbContext context, IWebHostEnvironment env, IStringLocalizer<SharedResource> localizer)
        {
            _context = context;
            _env = env;
            _localizer = localizer;
        }
        public List<Event> GetUpcomingEventsForOrganier(int id)
        {
            var now = DateTime.Now;
            var events = _context.Events
                .Where(e => e.OrganizerID == id && e.ParentEventId == 0).ToList();
            if (events == null || !events.Any())
            {
                throw new Exception(_localizer["organizer.no_events_found"].ToString());
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
                throw new Exception(_localizer["organizer.no_events_found"].ToString());
            }
            return events;
        }
        public async Task CreateEventForOrganizer(CreateEventDto model, int organizerID)
        {
            if (model == null)
            {
                throw new ArgumentNullException(nameof(model), _localizer["common.model_cannot_be_null"].ToString());
            }
            if (organizerID <= 0)
            {
                throw new ArgumentException(_localizer["common.invalid_id"].ToString(), nameof(organizerID));
            }
            if (model.Tickets != null && model.Tickets.Any())
            {
                if (model.Tickets.Any(t => t.Price <= 0))
                {
                    throw new ArgumentException(_localizer["tickets.price_gt_zero"].ToString());
                }
            }
            if (model.Capacity != -1 && model.Capacity <= 0)
                throw new ArgumentException(_localizer["event.capacity_invalid"].ToString());

            //provera da broj karata ne predje kapacitet
            var totalQuota = model.Tickets?.Sum(t => t.Quota) ?? 0;
            if (model.Capacity != -1 && totalQuota > model.Capacity)
            {
                throw new ArgumentException(_localizer["event.capacity_below_quota"].ToString());
            }
            string imageName = null;
            if (model.ImageFile != null)
            {
                imageName = await CommonHelpers.SaveImageAsync(model.ImageFile, _env);
            }
            bool isFree = model.Tickets == null || !model.Tickets.Any();

            EventStatus initialStatus = EventStatus.Draft;
            if (model.ParentEventId > 0)
            {
                var parentEvent = await _context.Events.FindAsync(model.ParentEventId);
                if (parentEvent != null && parentEvent.Status == EventStatus.Published)
                {
                    initialStatus = EventStatus.Published;
                }
            }

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
                Status = initialStatus,
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
        public async Task PublishEvent(int eventId, int organizerId)
        {
            if (eventId <= 0)
                throw new ArgumentException(_localizer["common.invalid_id"].ToString(), nameof(eventId));

            if (organizerId <= 0)
                throw new ArgumentException(_localizer["common.invalid_id"].ToString(), nameof(organizerId));

            var eventEntity = await _context.Events
                .FirstOrDefaultAsync(e => e.EventID == eventId && e.OrganizerID == organizerId);

            if (eventEntity == null)
                throw new ArgumentException(_localizer["event.not_found_or_permission"].ToString());

            if (eventEntity.Status == EventStatus.Published)
                throw new InvalidOperationException(_localizer["event.already_published"].ToString());

            if (eventEntity.Status == EventStatus.Canceled)
                throw new InvalidOperationException(_localizer["event.cannot_publish_canceled"].ToString());

            
            if (string.IsNullOrWhiteSpace(eventEntity.Title))
                throw new InvalidOperationException(_localizer["event.title_required"].ToString());

            if (string.IsNullOrWhiteSpace(eventEntity.Location))
                throw new InvalidOperationException(_localizer["event.location_required"].ToString());
            
            if (eventEntity.StartDate == default(DateTime))
                throw new InvalidOperationException(_localizer["event.start_date_required"].ToString());

            if (eventEntity.EndDate == default(DateTime))
                throw new InvalidOperationException(_localizer["event.end_date_required"].ToString());

            if (eventEntity.StartDate >= eventEntity.EndDate)
                throw new InvalidOperationException(_localizer["event.start_date_before_end_date"].ToString());

            if (eventEntity.StartDate <= DateTime.UtcNow)
                throw new InvalidOperationException(_localizer["event.start_date_future"].ToString());

            if (!eventEntity.isFree)
            {
                var hasTickets = await _context.Tickets
                    .AnyAsync(t => t.EventID == eventId);

                if (!hasTickets)
                    throw new InvalidOperationException(_localizer["event.paid_event_tickets_required"].ToString());
            }


            if (eventEntity.EndDate < DateTime.Today)
                throw new InvalidOperationException(_localizer["event.end_date_past"].ToString());


            
            var subevents = await _context.Events
                .Where(e => e.ParentEventId == eventId)
                .ToListAsync();

            foreach (var subevent in subevents)
            {
                
                if (string.IsNullOrWhiteSpace(subevent.Title))
                    throw new InvalidOperationException(_localizer["subevent.title_required", subevent.Title].ToString());

                if (string.IsNullOrWhiteSpace(subevent.Location))
                    throw new InvalidOperationException(_localizer["subevent.location_required", subevent.Title].ToString());

                if (subevent.StartDate >= subevent.EndDate)
                    throw new InvalidOperationException(_localizer["subevent.start_date_before_end_date", subevent.Title].ToString());

                if (subevent.StartDate < DateTime.Today)
                    throw new InvalidOperationException(_localizer["subevent.start_date_past", subevent.Title].ToString());
            }

            eventEntity.Status = EventStatus.Published;
            eventEntity.PublishedAt = DateTime.UtcNow;

            foreach (var subevent in subevents)
            {
                if (subevent.Status != EventStatus.Published)
                {
                    subevent.Status = EventStatus.Published;
                    subevent.PublishedAt = DateTime.UtcNow;
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

        public async Task DeleteEvent(int eventId,int organizerId)
        {

            using var transaction = await _context.Database.BeginTransactionAsync();
            try 
            {
                var eventEntity = await _context.Events
                    .FirstOrDefaultAsync(e => e.EventID == eventId && e.OrganizerID == organizerId);

                if (eventEntity == null)
                    throw new ArgumentException(_localizer["event.not_found_or_permission"].ToString());

            
                if (eventEntity.Status != EventStatus.Draft && eventEntity.Status != EventStatus.Canceled)
                    throw new InvalidOperationException(_localizer["event.delete_only_draft_canceled"].ToString());

            
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

            
                var eventPins = await _context.EventPin
                    .Where(p => p.EventId == eventId)
                    .ToListAsync();
                _context.EventPin.RemoveRange(eventPins);

            
                foreach (var subevent in subevents)
                {
                    var subeventPins = await _context.EventPin
                        .Where(p => p.EventId == subevent.EventID)
                        .ToListAsync();
                    _context.EventPin.RemoveRange(subeventPins);
                }


                await DeallocateEventResources(eventId);

            
                foreach (var subevent in subevents)
                {
                    await DeallocateEventResources(subevent.EventID);
                }

            
                _context.Events.RemoveRange(subevents);

            
                var tickets = await _context.Tickets
                    .Where(t => t.EventID == eventId)
                    .ToListAsync();
                _context.Tickets.RemoveRange(tickets);


            
                _context.Events.Remove(eventEntity);

            
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        
        private async Task DeallocateEventResources(int eventId)
        {
            try
            {
                
                var eventResources = await _context.EventResources
                    .Include(er => er.Resource)
                    .Where(er => er.EventID == eventId)
                    .ToListAsync();

                if (!eventResources.Any())
                    return;


                foreach (var eventResource in eventResources)
                {
                    if (eventResource.Status == EventResourceStatus.Approved)
                    {
                        var resource = eventResource.Resource;

                        if (resource.IsExhaustable)
                        {
                            resource.Quantity += eventResource.Quantity;
                        }

                        
                        if (resource.IsAvailable == ResourceAvailability.Booked)
                        {
                            
                            if (resource.IsExhaustable && resource.Quantity > 0)
                            {
                                resource.IsAvailable = ResourceAvailability.Available;
                            }
                            
                            else if (!resource.IsExhaustable)
                            {
                                var otherApprovedReservations = await _context.EventResources
                                    .Where(er => er.ResourceID == resource.ResourceID
                                             && er.ID != eventResource.ID
                                             && er.Status == EventResourceStatus.Approved)
                                    .AnyAsync();

                                if (!otherApprovedReservations)
                                {
                                    resource.IsAvailable = ResourceAvailability.Available;
                                }
                            }
                        }

                        _context.Resources.Update(resource);
                    }
                }
                _context.EventResources.RemoveRange(eventResources);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Error releasing resources for event {eventId}: {ex.Message}", ex);
            }
        }

        public async Task CancelEvent(int eventId,int organizerId)
        {
            if (eventId <= 0)
                throw new ArgumentException(_localizer["common.invalid_id"].ToString(), nameof(eventId));

            if (organizerId <= 0)
                throw new ArgumentException(_localizer["common.invalid_id"].ToString(), nameof(organizerId));


            using var transaction = await _context.Database.BeginTransactionAsync();
            try { 
                var eventEntity = await _context.Events
                       .FirstOrDefaultAsync(e => e.EventID == eventId && e.OrganizerID == organizerId);

                if (eventEntity == null)
                    throw new ArgumentException(_localizer["event.not_found_or_permission"].ToString());

            
                if (eventEntity.Status == EventStatus.Canceled)
                    throw new InvalidOperationException(_localizer["event.already_canceled"].ToString());

                if (eventEntity.Status == EventStatus.Draft)
                    throw new InvalidOperationException(_localizer["event.draft_delete"].ToString());

            
                if (eventEntity.StartDate <= DateTime.UtcNow)
                    throw new InvalidOperationException(_localizer["event.cannot_cancel_started"].ToString());


                var hasPurchasedTickets = await _context.UserTickets
                    .AnyAsync(ut => ut.Ticket.EventID == eventId);

                if (hasPurchasedTickets)
                {
                    await RefundPurchasedTickets(eventId);
                }


                
                await DeallocateEventResourcesForPublishedEvent(eventId);

                
                var subevents = await _context.Events
                    .Where(e => e.ParentEventId == eventId)
                    .ToListAsync();

                foreach (var subevent in subevents)
                {
                    await DeallocateEventResourcesForPublishedEvent(subevent.EventID);

                    
                    subevent.Status = EventStatus.Canceled;
                }


                
                var eventPins = await _context.EventPin
                    .Where(p => p.EventId == eventId)
                    .ToListAsync();
                _context.EventPin.RemoveRange(eventPins);

                
                foreach (var subevent in subevents)
                {
                    var subeventPins = await _context.EventPin
                        .Where(p => p.EventId == subevent.EventID)
                        .ToListAsync();
                    _context.EventPin.RemoveRange(subeventPins);
                }

                
                var favoriteEvents = await _context.FavoriteEvents
                    .Where(f => f.EventId == eventId)
                    .ToListAsync();
                _context.FavoriteEvents.RemoveRange(favoriteEvents);

                
                foreach (var subevent in subevents)
                {
                    var subeventFavorites = await _context.FavoriteEvents
                        .Where(f => f.EventId == subevent.EventID)
                        .ToListAsync();
                    _context.FavoriteEvents.RemoveRange(subeventFavorites);
                }

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

        public async Task DeallocateEventResourcesForPublishedEvent(int eventId)
        {
            try
            {
                var eventResources = await _context.EventResources
                    .Include(er => er.Resource)
                    .Where(er => er.EventID == eventId)
                    .ToListAsync();

                if (!eventResources.Any())
                    return;

                foreach (var eventResource in eventResources)
                {
                    if (eventResource.Status == EventResourceStatus.Approved)
                    {
                        var resource = eventResource.Resource;

                        
                        if (!resource.IsExhaustable)
                        {
                            
                            var otherApprovedReservations = await _context.EventResources
                                .Where(er => er.ResourceID == resource.ResourceID
                                         && er.ID != eventResource.ID
                                         && er.Status == EventResourceStatus.Approved)
                                .AnyAsync();

                            
                            if (!otherApprovedReservations)
                            {
                                resource.IsAvailable = ResourceAvailability.Available;
                            }
                        }

                        _context.Resources.Update(resource);
                    }
                }

                var eventResourceIds = eventResources.Select(er => er.ID).ToList();

                if (eventResourceIds.Any())
                {
                    var userReservations = await _context.UserResourceReservations
                        .Where(urr => eventResourceIds.Contains(urr.EventResourceID))
                        .ToListAsync();

                    if (userReservations.Any())
                    {
                        _context.UserResourceReservations.RemoveRange(userReservations);
                    }
                }
                _context.EventResources.RemoveRange(eventResources);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException(_localizer["common.resource_release_error", eventId].ToString(), ex);
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
                throw new ArgumentNullException(nameof(activity), _localizer["common.activity_cannot_be_null"].ToString());

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
