using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Helpers;
using Backend.Services;
using System.Globalization;

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

        
        [HttpPut("events")]
        public async Task<IActionResult> UpdateEvent([FromBody] UpdateEventDto dto)
        {
            var eventEntity = await _context.Events.FindAsync(dto.EventId);
            if (eventEntity == null)
                return NotFound();

            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
            if (eventEntity.OrganizerID != userId)
                return NotFound("Nemate pravo da izmenite ovaj event.");


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

        [HttpGet("monthly-stats")]
        public async Task<IActionResult> GetMonthlyStats(int organizerId,int? year = null) 
        {
            try
            {
                int targetYear = year ?? DateTime.Now.Year;

                var eventIds = await _context.Events
                    .Where(e => e.OrganizerID == organizerId
                             && e.StartDate.Year == targetYear)
                    .Select(e => e.EventID)
                    .ToListAsync();

                var ticketInfos = await _context.Tickets
                    .Where(t => eventIds.Contains(t.EventID))
                    .Select(t => new { t.TicketID, t.Price })
                    .ToListAsync();

                var ticketIds = ticketInfos.Select(t => t.TicketID).ToList();

                var userTicketInfos = await _context.UserTickets
                    .Where(ut => ticketIds.Contains(ut.TicketID))
                    .Select(ut => new { ut.TicketID, Month = ut.PurchasedAt.Month })
                    .ToListAsync();

                var joined = from ut in userTicketInfos
                             join ti in ticketInfos on ut.TicketID equals ti.TicketID
                             select new { ut.Month, ti.Price };

                var monthlyData = joined
                    .GroupBy(x => x.Month)
                    .Select(g => new
                    {
                        MonthNumber = g.Key,
                        Visitors = g.Count(),
                        Revenue = g.Sum(x => x.Price)
                    })
                    .ToList();

                var monthNames = CultureInfo
                    .CurrentCulture
                    .DateTimeFormat
                    .MonthNames
                    .Take(12)
                    .ToArray();

                var result = Enumerable.Range(1, 12)
                    .Select(m => new OrganizerStatsDto
                    {
                        Month = monthNames[m - 1],
                        Visitors = monthlyData
                                    .FirstOrDefault(x => x.MonthNumber == m)?
                                    .Visitors ?? 0,
                        Revenue = monthlyData
                                    .FirstOrDefault(x => x.MonthNumber == m)?
                                    .Revenue ?? 0m
                    })
                    .ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        
        [HttpGet("tickets/{eventId}")]
        public async Task<IActionResult> GetTicketsForOrganizer(int eventId)
        {
            var organizerId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            var eventEntity =await _context.Events
                .FirstOrDefaultAsync(e => e.EventID == eventId && e.OrganizerID == organizerId);

            if (eventEntity == null)
                return NotFound("Nemate pristup ovom događaju.");

            var tickets = await _context.Tickets
                .Where(t => t.EventID == eventId)
                .Select(t => new {
                    t.TicketID,
                    t.EventID,
                    t.TypeName,
                    t.Description,
                    t.Price,
                    t.Quota,
                    t.validFrom,
                    t.validUntil
                })
                .ToListAsync();

            return Ok(tickets);

        }

        [HttpPost("tickets")]
        public async Task<IActionResult> CreateTicket([FromBody] TicketDto ticketDto)
        {
            if (ticketDto==null)
            {
                return BadRequest("Podaci o karti nisu prosleđeni.");
            }

            var organizerId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            var eventEntity = await _context.Events
                .FirstOrDefaultAsync(e => e.EventID == ticketDto.EventId && e.OrganizerID == organizerId);
            if (eventEntity == null)
                return NotFound("Event nije pronađen ili nemate pravo da dodate kartu za ovaj event.");

            var newTicket = new Ticket
            {
                TypeName = ticketDto.Name,
                Price = ticketDto.Price,
                EventID = ticketDto.EventId,
                Quota = ticketDto.Quota,
                Description = ticketDto.Description,
                validFrom = ticketDto.ValidFrom,
                validUntil = ticketDto.ValidUntil
            };
            _context.Tickets.Add(newTicket);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception)
            {
                throw;
            }

            return Ok(new
            {
                message = "Karta uspešno kreirana.",
                ticketId = newTicket.TicketID
            });
        }

        [HttpPut("tickets")]
        public async Task<IActionResult> UpdateTicket([FromBody] TicketDto ticketDto)
        {
            if (ticketDto == null)
                return BadRequest();

            
            int organizerId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            
            var existingTicket = await _context.Tickets
                .Include(t => t.Event)
                .FirstOrDefaultAsync(t => t.TicketID == ticketDto.TicketId && t.Event.OrganizerID == organizerId);

            if (existingTicket == null)
                return NotFound("Karta nije pronađena ili nemate pravo da je izmenite.");

            
            if (ticketDto.EventId != existingTicket.EventID)
            {
                var newEventEntity = await _context.Events
                    .FirstOrDefaultAsync(e => e.EventID == ticketDto.EventId && e.OrganizerID == organizerId);

                if (newEventEntity == null)
                    return NotFound("Event nije pronađen ili nemate pravo da koristite ovaj event.");
            }

            
            existingTicket.TypeName = ticketDto.Name;
            existingTicket.Price = ticketDto.Price;
            existingTicket.EventID = ticketDto.EventId;
            existingTicket.Quota = ticketDto.Quota;
            existingTicket.Description = ticketDto.Description;
            existingTicket.validFrom = ticketDto.ValidFrom;
            existingTicket.validUntil = ticketDto.ValidUntil;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception)
            {
                throw;
            }

            return Ok(new
            {
                message = "Karta uspešno izmenjena.",
                ticketId = existingTicket.TicketID
            });
        }
    }
}
