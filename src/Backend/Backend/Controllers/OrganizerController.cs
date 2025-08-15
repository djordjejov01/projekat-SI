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
            string imageName = await CommonHelpers.SaveImageAsync(model.Image, _env);

            Organizer organizer = _context.Organizers.Where(o => o.Id == model.Id).First();
            if (organizer is null)
                return BadRequest("ERROR!");

            
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == model.Id);
            if (user == null)
                return BadRequest("User not found!");

            
            string oldOrganizerImage = organizer.Image;
            string oldUserImage = user.ProfilePicture;

            
            await CommonHelpers.RemovePhoto(organizer.Image, _env);
            organizer.Image = imageName;
            user.ProfilePicture = imageName;

            _context.Organizers.Update(organizer);
            _context.Users.Update(user);
            _context.SaveChanges();

            return Ok();
        }
        [HttpPost("update-organizer")]
        public async Task<IActionResult> UpdateOrganizer([FromBody] OrganizerDto model)
        {
            var organizer = _context.Organizers.Where(o => o.Id == model.Id).FirstOrDefault();
            if (organizer is null)
                return BadRequest(new { message = "Organizer with that ID does not exist." });

            
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == model.Id);
            if (user == null)
                return BadRequest(new { message = "User not found." });

            
            if (model.Name != organizer.Name && !string.IsNullOrEmpty(model.Name))
                organizer.Name = model.Name;

            
            if (model.Username != organizer.Username)
            {
                if (_context.Organizers.Any(o => o.Username == model.Username))
                    return BadRequest(new { message = "Username already exists." });

                organizer.Username = model.Username;
                user.Username = model.Username;
            }

            
            if (model.Email != organizer.Email)
            {
                if (!CommonHelpers.IsEmailInValidForm(model.Email))
                    return BadRequest(new { message = "Invalid email format." });
                if (_context.Organizers.Any(o => o.Email == model.Email))
                    return BadRequest(new { message = "Email already exists." });

                organizer.Email = model.Email;
                user.Email = model.Email;
            }

            
            if (model.PhoneNumber != organizer.PhoneNumber)
            {
                if (!CommonHelpers.IsPhoneNumberValid(model.PhoneNumber))
                    return BadRequest(new { message = "Invalid phone number format." });
                if (_context.Organizers.Any(o => o.PhoneNumber == model.PhoneNumber))
                    return BadRequest(new { message = "Phone number already exists." });

                organizer.PhoneNumber = model.PhoneNumber;
                user.PhoneNumber = model.PhoneNumber;
            }

            
            _context.Organizers.Update(organizer);
            _context.Users.Update(user);
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

        
        [HttpPost("events/publish")]
        public async Task<IActionResult> PublishEvent([FromBody] int eventId)
        {
            try
            {
                var organizerId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

                await _organizerService.PublishEvent(eventId, organizerId);

                return Ok(new { message = "Event uspešno objavljen." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Došlo je do greške prilikom objavljivanja eventa." });
            }
        }

        [HttpDelete("events")]
        public async Task<IActionResult> DeleteEvent([FromBody] int eventId)
        {
            try
            {
                var organizerId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

                await _organizerService.DeleteEvent(eventId, organizerId);

                return Ok(new { message = "Event uspešno obrisan." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Došlo je do greške prilikom brisanja eventa." });
            }
        }
        [HttpPost("events/cancel")]
        public async Task<IActionResult> CancelEvent([FromBody] int eventId)
        {
            try
            {
                var organizerId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

                await _organizerService.CancelEvent(eventId, organizerId);

                return Ok(new { message = "Događaj uspešno otkazan." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Greška prilikom otkazivanja događaja." });
            }
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

        [HttpDelete("activity")]
        public async Task<IActionResult> DeleteActivity([FromBody] int activityId)
        {
            try
            {
                var organizerId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

                
                var activity = await _context.EventActivities
                    .Include(a => a.Event)
                    .FirstOrDefaultAsync(a => a.ActivityID == activityId);

                if (activity == null)
                    return NotFound(new { message = "Aktivnost nije pronađena." });

                
                if (activity.Event.OrganizerID != organizerId)
                    return StatusCode(403, new { message = "Možete da brišete samo aktivnosti iz svojih događaja." });


                _context.EventActivities.Remove(activity);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Aktivnost uspešno obrisana." });
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

            if (ticketDto.Price <= 0)
            {
                return BadRequest("Karta mora imati cenu veću od 0 RSD.");
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

            eventEntity.isFree = false;

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

            if (ticketDto.Price <= 0)
            {
                return BadRequest("Karta mora imati cenu veću od 0 RSD.");
            }

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

            
            var eventId = ticketDto.EventId;
            var allTicketsForEvent = await _context.Tickets
                .Where(t => t.EventID == eventId)
                .ToListAsync();

            var eventEntity = await _context.Events
                .FirstOrDefaultAsync(e => e.EventID == eventId);

            if (eventEntity != null)
            {

                eventEntity.isFree = !allTicketsForEvent.Any();
            }

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

        [HttpDelete("tickets")]
        public async Task<IActionResult> DeleteTicket([FromBody] int ticketId)
        {
            if (ticketId <= 0)
                return BadRequest("Neispravan ID karte.");

            int organizerId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            
            var existingTicket = await _context.Tickets
                .Include(t => t.Event)
                .FirstOrDefaultAsync(t => t.TicketID == ticketId && t.Event.OrganizerID == organizerId);

            if (existingTicket == null)
                return NotFound("Karta nije pronađena ili nemate pravo da je obrišete.");

            
            var purchasedTickets = await _context.UserTickets
                .CountAsync(ut => ut.TicketID == ticketId);

            if (purchasedTickets > 0)
                return BadRequest("Nije moguće obrisati kartu jer postoje kupljene karte.");

            var eventId = existingTicket.EventID;

            try
            {
                _context.Tickets.Remove(existingTicket);
                await _context.SaveChangesAsync();

                
                var remainingTicketsForEvent = await _context.Tickets
                    .Where(t => t.EventID == eventId)
                    .ToListAsync();

                var eventEntity = await _context.Events
                    .FirstOrDefaultAsync(e => e.EventID == eventId);

                if (eventEntity != null)
                {
                    
                    eventEntity.isFree = !remainingTicketsForEvent.Any() || remainingTicketsForEvent.All(t => t.Price == 0);
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception)
            {
                throw;
            }

            return Ok(new
            {
                message = "Karta uspešno obrisana.",
                ticketId = ticketId
            });
        }
        [HttpGet("suppliers")]
        public async Task<IActionResult> GetSuppliers()
        {
            var suppliers = await _context.Suppliers.ToListAsync();
            //var suppliers = await _context.Users
            //    .Where(u => u.Role == UserRole.Supplier)
            //    .ToListAsync();
            return Ok(suppliers);
        }
        [HttpGet("supplier/{supplierId}/resources")]
        public async Task<IActionResult> GetSupplierResources(int supplierId)
        {
            var resources = await _context.Resources
                .Where(r => r.SupplierID == supplierId)
                .ToListAsync();
            return Ok(resources);
        }
        [HttpPost("eventresource/request")]
        public async Task<IActionResult> RequestResource([FromBody] EventResourceDto dto)
        {
            var resource = await _context.Resources.FindAsync(dto.ResourceID);
            if (resource == null)
                return NotFound("Resource not found.");

            if (resource.Quantity < dto.Quantity)
                return BadRequest("Not enough quantity available.");

            var eventResource = new EventResource
            {
                SupplierID = dto.SupplierID,
                EventID = dto.EventID,
                ResourceID = dto.ResourceID,
                Quantity = dto.Quantity,
                Measure = dto.Measure,
                IsReservable = dto.IsReservable,
                Status = EventResourceStatus.Pending
            };

            _context.EventResources.Add(eventResource);
            await _context.SaveChangesAsync();

            dto.ID = eventResource.ID;

            return Ok(dto);
        }

        [HttpGet("event/{eventId}/eventresources")]
        public async Task<IActionResult> GetEventResourcesForEvent(int eventId)
        {
            var eventResources = await _context.EventResources
                .Where(er => er.EventID == eventId)
                .Include(er => er.Resource)
                .ToListAsync();

            var dtos = eventResources.Select(er => new EventResourceDto
            {
                ID = er.ID,
                SupplierID = er.SupplierID,
                EventID = er.EventID,
                ResourceID = er.ResourceID,
                Quantity = er.Quantity,
                Measure = er.Measure,
                IsReservable = er.IsReservable,
                Status = er.Status,
            }).ToList();

            return Ok(dtos);
        }
    }
}
