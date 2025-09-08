using Backend.Helpers;
using Backend.Models;
using Backend.Models.Dto;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using System.Security.Claims;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventsController : ControllerBase
    {
        private readonly IEventService _eventService;
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly IStringLocalizer<SharedResource> _localizer;
        public EventsController(AppDbContext context, IEventService eventService, IWebHostEnvironment env, IStringLocalizer<SharedResource> localizer)
        {
            _context = context;
            _env = env;
            _eventService = eventService;
            _env = env;
            _localizer = localizer;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventListDto>>> GetAllEvents()
        {
            var events = await _context.Events
                .Where(e => e.Status == EventStatus.Published)
                .OrderBy(e => e.StartDate)
                .Select(e => new EventListDto
                {
                    Id = e.EventID,
                    Title = e.Title,
                    Location = e.Location,
                    StartDate = e.StartDate,
                    EndDate = e.EndDate,
                    ImageUrl = e.ImageUrl,
                    Category = e.Category,
                    AttendingCount = _context.UserTickets.Count(ut => ut.Ticket.EventID == e.EventID),
                    ParentEventId = e.ParentEventId
                })
                .ToListAsync();

            return Ok(events);
        }
        [AllowAnonymous]
        [HttpGet("upcomingEvents")]
        public async Task<ActionResult<IEnumerable<EventListDto>>> GetUpcomingEvents()
        {
            var now = DateTime.UtcNow;

            var events = await _context.Events
                .Where(e => e.StartDate > now && e.Status == EventStatus.Published)
                .OrderBy(e => e.StartDate)
                .Select(e => new EventListDto
                {
                    Id = e.EventID,
                    Title = e.Title,
                    Location = e.Location,
                    StartDate = e.StartDate,
                    EndDate = e.EndDate,
                    ImageUrl = e.ImageUrl,
                    Category = e.Category,
                    AttendingCount = _context.UserTickets
                        .Include(ut => ut.Ticket)
                        .Count(ut => ut.Ticket.EventID == e.EventID),
                    ParentEventId = e.ParentEventId
                })
                .ToListAsync();

            return Ok(events);
        }

        [AllowAnonymous]
        [HttpGet("Details")]
        public async Task<ActionResult<EventDetailsDto>> GetEventDetails(int id)
        {

            var eventEntity = await _context.Events
                .Include(e => e.Organizer)
                .FirstOrDefaultAsync(e => e.EventID == id);

            if (eventEntity == null || eventEntity.Status != EventStatus.Published)
                return NotFound();


            var agenda = await _context.EventActivities
                .Where(a => a.EventID == id)
                .OrderBy(a => a.StartTime)
                .Select(a => new EventActivityDto
                {
                    Title = a.Title,
                    Description = a.Description,
                    StartTime = a.StartTime,
                    EndTime = a.EndTime,
                    Category = a.Category,
                })
                .ToListAsync();


            var attendingCount = await _context.UserTickets
                .Include(ut => ut.Ticket)
                .CountAsync(ut => ut.Ticket.EventID == id);


            bool isFavorite = false;
            if (User.Identity.IsAuthenticated)
            {
                var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
                isFavorite = await _context.FavoriteEvents
                .AnyAsync(f => f.UserId == userId && f.EventId == id);
            }

            var prices = await _context.Tickets
                .Where(t => t.EventID == id)
                .Select(t => t.Price)
                .ToListAsync();

            decimal? minPrice = prices.Count > 0 ? prices.Min() : (decimal?)null;
            decimal? maxPrice = prices.Count > 0 ? prices.Max() : (decimal?)null;

            var dto = new EventDetailsDto
            {
                Id = eventEntity.EventID,
                Title = eventEntity.Title,
                ImageUrl = eventEntity.ImageUrl,
                Location = eventEntity.Location,
                StartDate = eventEntity.StartDate,
                EndDate = eventEntity.EndDate,
                Description = eventEntity.Description,
                OrganizerId = eventEntity.OrganizerID,
                OrganizerName = eventEntity.Organizer.Username,
                AttendingCount = attendingCount,
                IsFavorite = isFavorite,
                Capacity = eventEntity.NumberOfPeople,
                Agenda = agenda,
                Category = eventEntity.Category,
                MinPrice = minPrice,
                MaxPrice = maxPrice

            };

            return Ok(dto);
        }
        [AllowAnonymous]
        [HttpGet("subevents-activities/{eventId}")]
        public async Task<ActionResult<EventsSubeventsActivitiesDto>> GetSubeventsAndActivities(int eventId)
        {

            var mainEvent = await _context.Events.AsNoTracking().FirstOrDefaultAsync(e => e.EventID == eventId);
            if (mainEvent == null || mainEvent.Status != EventStatus.Published)
                return NotFound();


            var subevents = await _context.Events
                .AsNoTracking()
                .Where(e => e.ParentEventId == eventId && e.Status == EventStatus.Published)
                .Select(e => new EventDto
                {
                    EventId = e.EventID,
                    Title = e.Title,
                    Location = e.Location,
                    StartDate = e.StartDate,
                    EndDate = e.EndDate,
                    ImageUrl = e.ImageUrl,
                    ParentEventId = e.ParentEventId,
                    Description = e.Description
                })
                .ToListAsync();


            var eventIds = subevents.Select(s => s.EventId).Append(eventId).ToList();

            var activities = await _context.EventActivities
                .AsNoTracking()
                .Where(a => eventIds.Contains(a.EventID))
                .OrderBy(a => a.StartTime)
                .Select(a => new ActivityDto
                {
                    ActivityId = a.ActivityID,
                    EventId = a.EventID,
                    Title = a.Title,
                    StartDate = a.StartTime,
                    EndDate = a.EndTime,
                    Description = a.Description,
                    Category = a.Category
                })
                .ToListAsync();

            return Ok(new EventsSubeventsActivitiesDto
            {
                EventsAndSubevents = subevents,
                Activities = activities
            });
        }


        [HttpPost("change-event-picture")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadEventPhoto([FromForm] UploadImageDto model)
        {
            string ImageName = await CommonHelpers.SaveImageAsync(model.Image, _env);
            Event o = _context.Events.Where(o => o.EventID == model.Id).First();
            if (o is null)
                return BadRequest(_localizer["common.unexpected_error"].ToString());
            if(o.ImageUrl != "images/default-image.png")
                await CommonHelpers.RemovePhoto(o.ImageUrl, _env);
            o.ImageUrl = ImageName;
            _context.Events.Update(o);
            _context.SaveChanges();
            return Ok(new { imageUrl = ImageName });
        }

        [AllowAnonymous]
        [HttpGet("search")]
        public async Task<ActionResult<List<EventListDto>>> SearchEvents([FromQuery] string? name, [FromQuery] string? category,
            [FromQuery] string? location, [FromQuery] bool? isFree,
            [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate,
            [FromQuery] bool? hasTickets, [FromQuery] string? sortOrder, [FromQuery] string? sortBy)
        {
            EventCategory? categoryEnum = null;
            if (!string.IsNullOrWhiteSpace(category))
            {
                if (Enum.TryParse<EventCategory>(category, true, out var parsedCategory))
                {
                    categoryEnum = parsedCategory;
                }
                else
                {
                    return BadRequest(_localizer["events.unknown_category"].ToString());
                }
            }
            var events = await _eventService.SearchEventsAsync(name, categoryEnum, location, isFree, startDate, endDate, hasTickets, sortOrder, sortBy);
            return Ok(events);

        }
        [AllowAnonymous]
        [HttpGet("categories")]
        public async Task<IActionResult> GetEventCategories()
        {
            var categories = await _context.EventCategories
                .Select(c => new
                {
                    Id = c.CategoryID,
                    Name = c.CategoryName.ToString(),
                })
                .ToListAsync();

            return Ok(categories);
        }

        [Authorize]
        [HttpGet("BasicInfo/{eventId}")]
        public async Task<IActionResult> GetEventBasicInfo(int eventId)
        {

            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
            var eventEntity = await _context.Events
                .FirstOrDefaultAsync(e => e.EventID == eventId && e.OrganizerID == userId);

            if (eventEntity == null)
                return NotFound(_localizer["organizer.no_access_event"].ToString());

            var attendingCount = await _context.UserTickets
                .Include(ut => ut.Ticket)
                .CountAsync(ut => ut.Ticket.EventID == eventId);

            var dto = new EventBasicInfoDto
            {
                EventID = eventEntity.EventID,
                Title = eventEntity.Title,
                Description = eventEntity.Description,
                Location = eventEntity.Location,
                StartDate = eventEntity.StartDate,
                EndDate = eventEntity.EndDate,
                Category = eventEntity.Category,
                Capacity = eventEntity.NumberOfPeople,
                AttendingCount = attendingCount,
                ImageUrl = eventEntity.ImageUrl,
                status = eventEntity.Status,
                ParentEventId = eventEntity.ParentEventId
            };

            return Ok(dto);
        }

    }
}
