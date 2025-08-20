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
    public class ResourceController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ResourceController(AppDbContext context)
        {
            _context = context;
        }

        [Authorize(Roles ="MobileUser")]
        [HttpGet("{eventId}/resources")]
        public async Task<IActionResult> GetResourcesForEvent(int eventId)
        {
            var resources =await _context.EventResources
                .Where(er => er.EventID == eventId && er.IsReservable && er.Event.EndDate > DateTime.UtcNow)
                .Select(er => new {
                    id = er.ID,                            
                    supplierID = er.SupplierID,
                    eventID = er.EventID,
                    quantity = er.Quantity,
                    name = er.Resource.Name
                })
                .ToListAsync();

            return Ok(resources);
        }


        [Authorize(Roles = "MobileUser")]
        [HttpPost("reserve")]
        public async Task<IActionResult> ReserveResource([FromBody] ResourceReservationDto dto)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            if (dto.Quantity <= 0)
                return BadRequest("The quantity must be greater than zero.");

            
            var eventResource =await _context.EventResources
                .Include(er => er.Event)
                .FirstOrDefaultAsync(er => er.ID == dto.EventResourceID);

            if (eventResource == null)
                return NotFound("Resource does not exist.");

            if (!eventResource.IsReservable)
                return BadRequest("This resource cannot be reserved.");

            if (eventResource.Event.EndDate < DateTime.UtcNow)
                return BadRequest("It is not possible to reserve a resource for an event that has already passed.");

            if (!eventResource.Event.isFree)
            {

                var hasTicket = _context.UserTickets
                    .Any(ut => ut.UserID == userId && ut.Ticket.EventID == eventResource.EventID);
                if (!hasTicket)
                    return BadRequest("You must have a ticket for this event to reserve a resource.");


                var userTicket = _context.UserTickets
                    .Include(ut => ut.Ticket)
                    .FirstOrDefault(ut => ut.UserTicketID == dto.UserTicketID && ut.UserID == userId);

                if (userTicket == null)
                    return BadRequest("You do not have a valid ticket for this event.");


                if (userTicket.Ticket.EventID != eventResource.EventID)
                    return BadRequest("The ticket is not for the same event as the resource you are trying to reserve.");

            }
            
            int alreadyReserved = _context.UserResourceReservations
                .Where(r => r.EventResourceID == dto.EventResourceID)
                .Sum(r => r.Quantity);

            if (alreadyReserved + dto.Quantity > eventResource.Quantity)
                return BadRequest("Not enough available resources.");

            

            var reservation = new UserResourceReservation
            {
                UserID = userId,
                EventResourceID = dto.EventResourceID,
                Quantity = dto.Quantity,
                UserTicketID = eventResource.Event.isFree ? (int?)null : dto.UserTicketID,
                ReservedAt = DateTime.UtcNow
            };

            await _context.UserResourceReservations.AddAsync(reservation);
            await _context.SaveChangesAsync();

            return Ok("Reservation successful.");
        }
        [HttpGet("resource-categories")]
        public IActionResult GetResourceCategories()
        {
            var categories = Enum.GetValues(typeof(ResourceCategory))
                .Cast<ResourceCategory>()
                .Select(c => new {
                    Id = (int)c,
                    Name = c.ToString()
                });
            return Ok(categories);
        }
        [HttpGet("availabilities")]
        public IActionResult GetAvailabilities()
        {
            var avs = Enum.GetValues(typeof(ResourceAvailability))
                .Cast<ResourceAvailability>()
                .Select(a => new {
                    Id = (int)a,
                    Name = a.ToString()
                });
            return Ok(avs);
        }
    }

}