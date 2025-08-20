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
                return NotFound("You do not have permission to edit this event.");

            if (dto.Capacity != -1 && dto.Capacity <= 0)
                return BadRequest("Capacity must be -1 (unlimited) or a positive number.");

            eventEntity.Title = dto.Title;
            eventEntity.Description = dto.Description;
            eventEntity.Location = dto.Location;
            eventEntity.StartDate = dto.StartDate;
            eventEntity.EndDate = dto.EndDate;
            eventEntity.Category = dto.Category;

            //provera da novi kapacitet ne sme da bude manji od broja vec postojecih karata
            var currentTotalQuota = await _context.Tickets
                .Where(t => t.EventID == eventEntity.EventID)
                .SumAsync(t => (int?)t.Quota) ?? 0;

            if (dto.Capacity != -1 && dto.Capacity <= currentTotalQuota)
                return BadRequest($"Cannot set capacity below current total ticket quota ({currentTotalQuota}).");

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

                return Ok(new { message = "Event published successfully." });
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
                return BadRequest(new { message = "An error occurred while publishing the event." });
            }
        }

        [HttpDelete("events")]
        public async Task<IActionResult> DeleteEvent([FromBody] int eventId)
        {
            try
            {
                var organizerId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

                await _organizerService.DeleteEvent(eventId, organizerId);

                return Ok(new { message = "Event deleted successfully." });
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
                return BadRequest(new { message = "An error occurred while deleting the event." });
            }
        }
        [HttpPost("events/cancel")]
        public async Task<IActionResult> CancelEvent([FromBody] int eventId)
        {
            try
            {
                var organizerId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

                await _organizerService.CancelEvent(eventId, organizerId);

                return Ok(new { message = "Event canceled successfully." });
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
                return BadRequest(new { message = "An error occurred while canceling the event." });
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
                    return NotFound(new { message = "Activity not found." });

                
                if (activity.Event.OrganizerID != organizerId)
                    return StatusCode(403, new { message = "You can only delete activities from your own events." });


                _context.EventActivities.Remove(activity);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Activity deleted successfully." });
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
                return NotFound("You do not have access to this event.");

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
                return BadRequest("Ticket information was not provided.");
            }

            if (ticketDto.Quota <= 0)
                return BadRequest("Ticket quota must be greater than 0.");

            if (ticketDto.Price <= 0)
            {
                return BadRequest("The ticket must have a price greater than 0 EUR.");
            }


            var organizerId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            var eventEntity = await _context.Events
                .FirstOrDefaultAsync(e => e.EventID == ticketDto.EventId && e.OrganizerID == organizerId);
            if (eventEntity == null)
                return NotFound("Event not found or you do not have permission to add a ticket for this event.");

            if (ticketDto.ValidFrom >= ticketDto.ValidUntil)
                return BadRequest("Ticket validFrom must be before validUntil.");
            if (ticketDto.ValidFrom < eventEntity.StartDate || ticketDto.ValidUntil > eventEntity.EndDate)
                return BadRequest("Ticket validity must be within event dates.");

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

            var usedQuota = await _context.Tickets
                .Where(t => t.EventID == ticketDto.EventId)
                .SumAsync(t => (int?)t.Quota) ?? 0;

            var cap = eventEntity.NumberOfPeople;
            if (cap != -1) // skip ako je unlimited
            {
                if (cap == null)
                    return BadRequest("Event capacity is not set.");
                if (cap <= usedQuota + ticketDto.Quota)
                    return BadRequest($"Total tickets across all types would exceed event capacity ({cap}).");
            }

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
                message = "Ticket created successfully.",
                ticketId = newTicket.TicketID
            });
        }

        [HttpPut("tickets")]
        public async Task<IActionResult> UpdateTicket([FromBody] TicketDto ticketDto)
        {
            if (ticketDto == null)
                return BadRequest();

            if (ticketDto.Quota <= 0) return BadRequest("Ticket quota must be greater than 0.");

            if (ticketDto.Price <= 0)
            {
                return BadRequest("The ticket must have a price greater than 0 EUR.");
            }

            int organizerId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            
            var existingTicket = await _context.Tickets
                .Include(t => t.Event)
                .FirstOrDefaultAsync(t => t.TicketID == ticketDto.TicketId && t.Event.OrganizerID == organizerId);

            if (existingTicket == null)
                return NotFound("Ticket not found or you do not have permission to edit it.");

            
            if (ticketDto.EventId != existingTicket.EventID)
            {
                var newEventEntity = await _context.Events
                    .FirstOrDefaultAsync(e => e.EventID == ticketDto.EventId && e.OrganizerID == organizerId);

                if (newEventEntity == null)
                    return NotFound("Event not found or you do not have permission to use this event.");
            }


            var targetEventId = ticketDto.EventId;
            var targetEventEntity = await _context.Events.FirstOrDefaultAsync(e => e.EventID == targetEventId);
            if (targetEventEntity == null)
                return NotFound("Event not found.");

            if (ticketDto.ValidFrom >= ticketDto.ValidUntil)
                return BadRequest("Ticket validFrom must be before validUntil.");
            if (ticketDto.ValidFrom < targetEventEntity.StartDate || ticketDto.ValidUntil > targetEventEntity.EndDate)
                return BadRequest("Ticket validity must be within event dates.");

            var otherQuotas = await _context.Tickets
                .Where(t => t.EventID == targetEventId && t.TicketID != ticketDto.TicketId)
                .SumAsync(t => (int?)t.Quota) ?? 0;

            var cap = targetEventEntity.NumberOfPeople;
            if (cap != -1 && cap <= otherQuotas + ticketDto.Quota)
                return BadRequest($"Total tickets across all types would exceed event capacity ({cap}).");


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
                message = "Ticket updated successfully.",
                ticketId = existingTicket.TicketID
            });
        }

        [HttpDelete("tickets")]
        public async Task<IActionResult> DeleteTicket([FromBody] int ticketId)
        {
            if (ticketId <= 0)
                return BadRequest("Invalid ticket ID.");

            int organizerId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            
            var existingTicket = await _context.Tickets
                .Include(t => t.Event)
                .FirstOrDefaultAsync(t => t.TicketID == ticketId && t.Event.OrganizerID == organizerId);

            if (existingTicket == null)
                return NotFound("Ticket not found or you do not have permission to delete it.");

            
            var purchasedTickets = await _context.UserTickets
                .CountAsync(ut => ut.TicketID == ticketId);

            if (purchasedTickets > 0)
                return BadRequest("Cannot delete the ticket because there are purchased tickets.");

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
                message = "Ticket deleted successfully.",
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
        public async Task<IActionResult> GetSupplierResources(int supplierId, int eventId)
        {
            var resources = await _context.Resources
                .Where(r => r.SupplierID == supplierId && r.IsAvailable == ResourceAvailability.Available)
                .ToListAsync();

            var ourEvent = await _context.Events
                .FirstOrDefaultAsync(x => x.EventID == eventId);

            if (ourEvent == null) return NotFound($"Event {eventId} not found.");

            // Retrieve all approved event resources, but exclude the ones from the current event.
            var otherEventResources = await _context.EventResources
                .Where(er => er.EventID != eventId && er.Status == EventResourceStatus.Approved)
                .ToListAsync();

            var eventStart = ourEvent.StartDate;
            var eventEnd = ourEvent.EndDate;

            // Use a list to store the resources to remove.
            var resourcesToRemove = new List<Resource>();

            foreach (var res in resources)
            {
                // Your logic: Only check time-based availability for inexhaustible resources.
                if (!res.IsExhaustable)
                {
                    // Check for overlaps with APPROVED bookings from *other events*.
                    bool overlaps = otherEventResources
                        .Where(er => er.ResourceID == res.ResourceID)
                        .Any(er =>
                            er.StartDateTimeBooked < eventEnd &&
                            er.EndDateTimeBooked > eventStart);

                    if (overlaps)
                    {
                        resourcesToRemove.Add(res);
                    }
                }
            }

            // Remove resources after the loop to avoid modifying the collection while iterating.
            resources.RemoveAll(r => resourcesToRemove.Contains(r));

            return Ok(resources);
        }

        [HttpPost("eventresource/request")]
        public async Task<IActionResult> RequestResource([FromBody] EventResourceDto dto)
        {
            var supplierResource = await _context.Resources.FindAsync(dto.ResourceID);
            if (supplierResource == null)
                return NotFound("Resource not found.");

            var existingEventResource = await _context.EventResources
                .FirstOrDefaultAsync(er => er.EventID == dto.EventID && er.ResourceID == dto.ResourceID);

            if (existingEventResource != null)
            {
                // If the resource is exhaustible and the request was previously approved,
                // we need to return the original quantity to the supplier's pool.
                if (supplierResource.IsExhaustable && existingEventResource.Status == EventResourceStatus.Approved)
                {
                    supplierResource.Quantity += existingEventResource.Quantity;
                }

                // Now, check if the supplier has enough to fulfill the new quantity
                if (supplierResource.IsExhaustable && supplierResource.Quantity < dto.Quantity)
                {
                    return BadRequest("Not enough quantity available to fulfill the new request.");
                }

                // Update the event resource to the new quantity, dates, and status.
                existingEventResource.Quantity = dto.Quantity;
                existingEventResource.StartDateTimeBooked = dto.StartDateTimeBooked;
                existingEventResource.EndDateTimeBooked = dto.EndDateTimeBooked;
                existingEventResource.Status = EventResourceStatus.Pending;

                _context.EventResources.Update(existingEventResource);
                _context.Resources.Update(supplierResource); // Mark supplier resource for update
            }
            else
            {
                // For a new request, check if the quantity is available.
                if (supplierResource.IsExhaustable && supplierResource.Quantity < dto.Quantity)
                {
                    return BadRequest("Not enough quantity available for a new request.");
                }

                var newEventResource = new EventResource
                {
                    SupplierID = dto.SupplierID,
                    EventID = dto.EventID,
                    ResourceID = dto.ResourceID,
                    Quantity = dto.Quantity,
                    IsReservable = dto.IsReservable,
                    Status = EventResourceStatus.Pending,
                    StartDateTimeBooked = dto.StartDateTimeBooked,
                    EndDateTimeBooked = dto.EndDateTimeBooked
                };
                _context.EventResources.Add(newEventResource);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Resource request submitted or updated successfully." });
        }

        [HttpDelete("eventresource/deallocate/{resourceId}/{eventId}")]
        public async Task<IActionResult> DeallocateResource(int resourceId, int eventId)
        {
            // Find the specific EventResource record to deallocate using both IDs.
            var eventResource = await _context.EventResources
                .Include(er => er.Resource) // Eagerly load the related Resource
                .FirstOrDefaultAsync(er => er.ResourceID == resourceId && er.EventID == eventId);

            if (eventResource == null)
            {
                return NotFound("Event resource allocation not found.");
            }

            // Condition 1: Only return quantity if the request was Approved and the resource is exhaustible.
            if (eventResource.Status == EventResourceStatus.Approved && eventResource.Resource.IsExhaustable)
            {
                // Restore the quantity to the supplier's resource.
                eventResource.Resource.Quantity += eventResource.Quantity;

                // If the resource was unavailable due to zero quantity, make it available again.
                if (eventResource.Resource.IsAvailable == ResourceAvailability.Unavailable && eventResource.Resource.Quantity > 0)
                {
                    eventResource.Resource.IsAvailable = ResourceAvailability.Available;
                }

                _context.Resources.Update(eventResource.Resource);
            }

            // Condition 2: Always remove the event's resource allocation record.
            _context.EventResources.Remove(eventResource);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Resource deallocated successfully." });
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
                IsReservable = er.IsReservable,
                Status = er.Status,
                // The Fix: Add the missing date fields from the entity.
                StartDateTimeBooked = er.StartDateTimeBooked,
                EndDateTimeBooked = er.EndDateTimeBooked
            }).ToList();

            return Ok(dtos);
        }
    }
}
