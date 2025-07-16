using Backend.Helpers;
using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public EventsController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventListDto>>> GetAllEvents()
        {
            var events = await _context.Events
                .OrderBy(e => e.StartDate)
                .Select(e => new EventListDto
                {
                    Id = e.EventID,
                    Title = e.Title,
                    Location = e.Location,
                    StartDate = e.StartDate,
                    ImageUrl = e.ImageUrl,
                    AttendingCount = _context.UserTickets.Count(ut => ut.Ticket.EventID == e.EventID)
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
                .Where(e => e.StartDate > now)
                .OrderBy(e => e.StartDate)
                .Select(e => new EventListDto
                {
                    Id = e.EventID,
                    Title = e.Title,
                    Location = e.Location,
                    StartDate = e.StartDate,
                    ImageUrl = e.ImageUrl,
                    AttendingCount = _context.UserTickets
                        .Include(ut => ut.Ticket)
                        .Count(ut => ut.Ticket.EventID == e.EventID)
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

            if (eventEntity == null)
                return NotFound();

            
            var agenda = await _context.EventActivities
                .Where(a => a.EventID == id)
                .OrderBy(a => a.StartTime)
                .Select(a => new EventActivityDto
                {
                    Title = a.Title,
                    Description = a.Description,
                    StartTime = a.StartTime,
                    EndTime = a.EndTime
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
                Agenda = agenda,

            };

            return Ok(dto);
        }

        [HttpPost("change-event-picture")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadOrganizerPhoto([FromForm] UploadImageDto model)
        {
            string ImageName = await CommonHelpers.SaveImageAsync(model.Image, _env);
            Event e = _context.Events.Where(e => e.EventID == model.Id).First();
            if (e is null)
                return BadRequest("ERROR!");
            await CommonHelpers.RemovePhoto(e.ImageUrl, _env);
            e.ImageUrl = ImageName;
            _context.Events.Update(e);
            _context.SaveChanges();
            return Ok();
        }

    }
}
