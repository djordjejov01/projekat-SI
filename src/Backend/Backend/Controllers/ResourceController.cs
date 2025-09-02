using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ResourceController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IStringLocalizer<SharedResource> _localizer;

        public ResourceController(AppDbContext context, IStringLocalizer<SharedResource> localizer)
        {
            _context = context;
            _localizer = localizer;
        }

        [Authorize(Roles = "MobileUser")]
        [HttpGet("{eventId}/resources")]
        public async Task<IActionResult> GetResourcesForEvent(int eventId)
        {
            var resources = await _context.EventResources
                .Where(er => er.EventID == eventId && er.IsReservable && er.Event.EndDate > DateTime.UtcNow)
                .Select(er => new {
                    id = er.ID,
                    supplierID = er.SupplierID,
                    eventID = er.EventID,
                    quantity = er.Quantity,
                    name = er.Resource.Name,
                    
                    availableQuantity = er.Quantity - _context.UserResourceReservations
                        .Where(urr => urr.EventResourceID == er.ID)
                        .Sum(urr => urr.Quantity)
                })
                .Where(r => r.availableQuantity > 0)
                .ToListAsync();

            return Ok(resources);
        }


        [Authorize(Roles = "MobileUser")]
        [HttpPost("reserve")]
        public async Task<IActionResult> ReserveResource([FromBody] ResourceReservationDto dto)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            if (dto.Quantity <= 0)
                return BadRequest(_localizer["resources.qty_positive"].Value);

            
            var eventResource =await _context.EventResources
                .Include(er => er.Event)
                .FirstOrDefaultAsync(er => er.ID == dto.EventResourceID);

            if (eventResource == null)
                return NotFound(_localizer["resources.not_exist"].Value);

            if (!eventResource.IsReservable)
                return BadRequest(_localizer["resources.not_reservable"].Value);

            if (eventResource.Event.EndDate < DateTime.UtcNow)
                return BadRequest(_localizer["resources.event_passed"].Value);

            if (!eventResource.Event.isFree)
            {

                var hasTicket = _context.UserTickets
                    .Any(ut => ut.UserID == userId && ut.Ticket.EventID == eventResource.EventID);
                if (!hasTicket)
                    return BadRequest(_localizer["resources.need_ticket"].Value);


                var userTicket = _context.UserTickets
                    .Include(ut => ut.Ticket)
                    .FirstOrDefault(ut => ut.UserTicketID == dto.UserTicketID && ut.UserID == userId);

                if (userTicket == null)
                    return BadRequest(_localizer["resources.ticket_missing"].Value);


                if (userTicket.Ticket.EventID != eventResource.EventID)
                    return BadRequest(_localizer["resources.ticket_wrong_event"].Value);

            }
            
            int alreadyReserved = _context.UserResourceReservations
                .Where(r => r.EventResourceID == dto.EventResourceID)
                .Sum(r => r.Quantity);

            if (alreadyReserved + dto.Quantity > eventResource.Quantity)
                return BadRequest(_localizer["resources.not_enough"].Value);

            

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

            return Ok(_localizer["resources.reserved"].Value);
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

        [Authorize(Roles = "MobileUser")]
        [HttpGet("my-reservations")]
        public async Task<IActionResult> GetMyResourceReservations()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            var myReservations = await _context.UserResourceReservations
                .Where(urr => urr.UserID == userId)
                .Include(urr => urr.EventResource)
                    .ThenInclude(er => er.Resource)
                .Include(urr => urr.EventResource)
                    .ThenInclude(er => er.Event)
                .Select(urr => new
                {
                    ReservationID = urr.Id,
                    ResourceName = urr.EventResource.Resource.Name,
                    ResourceCategory = urr.EventResource.Resource.Category.ToString(),
                    EventTitle = urr.EventResource.Event.Title,
                    EventDate = urr.EventResource.Event.StartDate,
                    EventLocation = urr.EventResource.Event.Location,
                    Quantity = urr.Quantity,
                    ReservedAt = urr.ReservedAt,
                    EventResourceID = urr.EventResourceID,
                    EventID = urr.EventResource.EventID,
                    IsEventFree = urr.EventResource.Event.isFree,
                    EventEndDate = urr.EventResource.Event.EndDate,
                    
                    ResourceDescription = urr.EventResource.Resource.Description,
                    UserTickets = _context.UserTickets
                        .Where(ut => ut.UserID == userId && ut.Ticket.EventID == urr.EventResource.EventID)
                        .Select(ut => new
                        {
                            UserTicketID = ut.UserTicketID,
                            TicketType = ut.Ticket.TypeName
                        })
                        .ToList()
                })
                .OrderByDescending(urr => urr.ReservedAt)
                .ToListAsync();

            return Ok(myReservations);
        }
    }

}