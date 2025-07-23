using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Helpers;
using Backend.Services;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Organizer")]

    public class OrganizerController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IOrganizerService _organizerService;
        private readonly IWebHostEnvironment _env;


        public OrganizerController(AppDbContext context, IOrganizerService organizerService, IWebHostEnvironment env)
        {
            _context = context;
            _organizerService = organizerService;
            _env = env;
        }
        [HttpGet("get-organizer")]
        public async Task<IActionResult> GetOrganizer(int id)
        {
            var Organizer = _context.Organizers.Where(o => o.Id == id).Select(o => new OrganizerDto
            {
                Id = o.Id,
                Username = o.Username,
                Email = o.Email,
                Name = o.Name,
                PhoneNumber = o.PhoneNumber,
                Image = o.Image
            }).FirstOrDefault();
            if (Organizer is not null)
                return Ok(Organizer);
            return BadRequest(new { message = "Organizer with that ID does not exist." });
        }
        [HttpPost("change-organizer-picture")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadOrganizerPhoto([FromForm] UploadImageDto model)
        {
            string ImageName = await CommonHelpers.SaveImageAsync(model.Image, _env);
            Organizer o = _context.Organizers.Where(o => o.Id == model.Id).First();
            if (o is null)
                return BadRequest("ERROR!");
            await CommonHelpers.RemovePhoto(o.Image, _env);
            o.Image = ImageName;
            _context.Organizers.Update(o);
            _context.SaveChanges();
            return Ok();
        }
        [HttpPost("update-organizer")]
        public async Task<IActionResult> UpdateOrganizer([FromBody] OrganizerDto model)
        {
            var organizer = _context.Organizers.Where(o => o.Id == model.Id).FirstOrDefault();

            if (organizer is null)
            {
                return BadRequest(new { message = "Organizer with that ID does not exist." });
            }

            if (model.Name != organizer.Name && !string.IsNullOrEmpty(model.Name))
                organizer.Name = model.Name;

            if (model.Username != organizer.Username)
            {
                if (_context.Organizers.Any(o => o.Username == model.Username))
                {
                    return BadRequest(new { message = "Username already exists." });
                }
                organizer.Username = model.Username;

            }

            if (model.Email != organizer.Email)
            {
                if (!CommonHelpers.IsEmailInValidForm(model.Email))
                {
                    return BadRequest(new { message = "Invalid email format." });
                }
                if (_context.Organizers.Any(o => o.Email == model.Email))
                {
                    return BadRequest(new { message = "Email already exists." });
                }
                organizer.Email = model.Email;
            }

            if (model.PhoneNumber != organizer.PhoneNumber)
            {
                if (!CommonHelpers.IsPhoneNumberValid(model.PhoneNumber))
                {
                    return BadRequest(new { message = "Invalid phone number format." });
                }
                if (_context.Organizers.Any(o => o.PhoneNumber == model.PhoneNumber))
                {
                    return BadRequest(new { message = "Phone number already exists." });
                }
                organizer.PhoneNumber = model.PhoneNumber;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "User data successfully changed!" });
        }
        [HttpGet("events")]
        public async Task<IActionResult> GetEventsForOrganier(int id)
        {
            try
            {
                var events = _organizerService.GetAllEventsForOrganier(id);
                return Ok(events);

            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpGet("upcoming-events")]
        public async Task<IActionResult> GetUpcomingEventsForOrganier(int id)
        {
            try
            {
                var events = _organizerService.GetUpcomingEventsForOrganier(id);
                return Ok(events);

            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpPost("create-event/{organizerID}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateEvent([FromForm] CreateEventDto model, [FromRoute] int organizerID)
        {
            try
            {
                await _organizerService.CreateEventForOrganizer(model, organizerID);
                return Created("Event created successfully.", null);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Organizer")]
        [HttpPut("events/{eventId}")]
        public async Task<IActionResult> UpdateEvent(int eventId, [FromBody] UpdateEventDto dto)
        {
            var eventEntity = await _context.Events.FindAsync(eventId);
            if (eventEntity == null)
                return NotFound();

            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
            if (eventEntity.OrganizerID != userId)
                return Forbid();


            eventEntity.Title = dto.Title;
            eventEntity.Description = dto.Description;
            eventEntity.Location = dto.Location;
            eventEntity.StartDate = dto.StartDate;
            eventEntity.EndDate = dto.EndDate;
            eventEntity.Category = dto.Category;
            eventEntity.NumberOfPeople = dto.Capacity;


            await _context.SaveChangesAsync();
            return Ok(eventEntity);
        }

        [HttpGet("event-category-stats")]
        public async Task<IActionResult> GetEventCategoryStats()
        {
            var organizerId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            var stats = await _context.Events
                .Where(e => e.OrganizerID == organizerId)
                .GroupBy(e => e.Category)
                .Select(g => new
                {
                    Category = g.Key.ToString(),
                    Count = g.Count()
                })
                .ToListAsync();

            var result = stats.ToDictionary(x => x.Category, x => x.Count);
            return Ok(result);
        }

        [HttpGet("event-status-stats")]
        public async Task<IActionResult> GetEventStatusStats()
        {
            var organizerId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            var stats = await _context.Events
                .Where(e => e.OrganizerID == organizerId)
                .GroupBy(e => e.Status)
                .Select(g => new
                {
                    Status = g.Key.ToString(),
                    Count = g.Count()
                })
                .ToListAsync();

            var result = stats.ToDictionary(x => x.Status, x => x.Count);
            return Ok(result);
        }

        [HttpGet("dashboard-metrics")]
        public async Task<IActionResult> GetDashboardMetrics()
        {
            var organizerId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            var totalEvents = await _context.Events.CountAsync(e => e.OrganizerID == organizerId);

            var totalTicketsSold = await _context.UserTickets
                .CountAsync(ut => ut.Ticket.Event.OrganizerID == organizerId);

            var totalRevenue = await _context.UserTickets
                .Where(ut => ut.Ticket.Event.OrganizerID == organizerId)
                .SumAsync(ut => (decimal?)ut.Ticket.Price) ?? 0;

            var uniqueLocations = await _context.Events
                .Where(e => e.OrganizerID == organizerId)
                .Select(e => e.Location)
                .Distinct()
                .CountAsync();

            var result = new
            {
                TotalEvents = totalEvents,
                TotalRevenue = totalRevenue,
                TotalTicketsSold = totalTicketsSold,
                UniqueLocations = uniqueLocations
            };
            return Ok(result);
        }

        [HttpGet("subevents-activities")]
        public async Task<IActionResult> GetSubeventsAndActivities(int eventId)
        {
            try
            {
                EventsSubeventsActivitiesDto subeventsActivitiesDto = await _organizerService.GetEventSubeventsActivities(eventId);
                return Ok(subeventsActivitiesDto);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpPost("activity")]
        public async Task<IActionResult> CreateActivity([FromBody] ActivityDto dto)
        {
            try
            {
                await _organizerService.CreateActivity(dto);
                return Created("Activity created successfully.", null);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
