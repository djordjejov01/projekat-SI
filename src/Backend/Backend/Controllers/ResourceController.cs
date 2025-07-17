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
        public IActionResult GetResourcesForEvent(int eventId)
        {
            var resources = _context.EventResources
                .Where(er => er.EventID == eventId && er.IsReservable && er.Event.EndDate > DateTime.UtcNow)
                .Select(er => new {
                    id = er.ID,                            // promenjeno sa ID -> id
                    supplierID = er.SupplierID,
                    eventID = er.EventID,
                    quantity = er.Quantity,
                    measure = er.Measure,
                    name = er.Resource.Name,               // promenjeno sa ResourceName -> name
                    price = (decimal?)er.Resource.Quantity // ako želiš neku cenu kao primer
                })
                .ToList();

            return Ok(resources);
        }


        [Authorize(Roles = "MobileUser")]
        [HttpPost("reserve")]
        public IActionResult ReserveResource([FromBody] ResourceReservationDto dto)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            if (dto.Quantity <= 0)
                return BadRequest("Količina mora biti veća od nule.");

            
            var eventResource = _context.EventResources
                .Include(er => er.Event)
                .FirstOrDefault(er => er.ID == dto.EventResourceID);

            if (eventResource == null)
                return NotFound("Resurs ne postoji.");

            if (!eventResource.IsReservable)
                return BadRequest("Ovaj resurs nije moguće rezervisati.");


            var hasTicket = _context.UserTickets
                .Any(ut => ut.UserID == userId && ut.Ticket.EventID == eventResource.EventID);
            if (!hasTicket)
                return BadRequest("Morate imati ulaznicu za ovaj događaj da biste rezervisali resurs.");


            if (eventResource.Event.EndDate < DateTime.UtcNow)
                return BadRequest("Nije moguće rezervisati resurs za događaj koji je prošao.");

            
            var userTicket = _context.UserTickets
                .Include(ut => ut.Ticket)
                .FirstOrDefault(ut => ut.UserTicketID == dto.UserTicketID && ut.UserID == userId);

            if (userTicket == null)
                return BadRequest("Nemate validnu ulaznicu za ovaj događaj.");

            
            if (userTicket.Ticket.EventID != eventResource.EventID)
                return BadRequest("Ulaznica nije za isti događaj kao resurs koji pokušavate da rezervišete.");

            
            int alreadyReserved = _context.UserResourceReservations
                .Where(r => r.EventResourceID == dto.EventResourceID)
                .Sum(r => r.Quantity);

            if (alreadyReserved + dto.Quantity > eventResource.Quantity)
                return BadRequest("Nema dovoljno dostupnih resursa.");

            //TODO(ogranicenje kolicine resursa)

            var reservation = new UserResourceReservation
            {
                UserID = userId,
                EventResourceID = dto.EventResourceID,
                Quantity = dto.Quantity,
                UserTicketID = dto.UserTicketID,
                ReservedAt = DateTime.UtcNow
            };

            _context.UserResourceReservations.Add(reservation);
            _context.SaveChanges();

            return Ok("Rezervacija uspešna.");
        }


    }
}