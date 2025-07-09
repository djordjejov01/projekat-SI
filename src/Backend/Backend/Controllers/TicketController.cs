using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TicketController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TicketController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("events/{eventId}/tickets")]
        public IActionResult GetTicketsForEvent(int eventId)
        {
            var tickets = _context.Tickets
                .Where(t => t.EventID == eventId)
                .Select(t => new {
                    t.TicketID,
                    t.TypeName,
                    t.Description,
                    t.Price,
                    t.Quota,
                    Available = t.Quota - _context.UserTickets.Count(ut => ut.TicketID == t.TicketID)
                })
                .ToList();

            return Ok(tickets);
        }

        
        [Authorize(Roles = "MobileUser")]
        [HttpPost("purchase")]
        public IActionResult PurchaseTicket([FromBody] PurchaseTicketDto dto)
        {

            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            var ticket = _context.Tickets.FirstOrDefault(t => t.TicketID == dto.TicketID);
            if (ticket == null)
                return NotFound("Ulaznica ne postoji.");

            int sold = _context.UserTickets.Count(ut => ut.TicketID == dto.TicketID);
            if (sold >= ticket.Quota)
                return BadRequest("Nema više dostupnih ulaznica za ovaj tip.");

            //TODO(ogranicenje)

            var userTicket = new UserTicket
            {
                UserID = userId,
                TicketID = dto.TicketID,
                PurchasedAt = DateTime.UtcNow
            };

            _context.UserTickets.Add(userTicket);
            _context.SaveChanges();

            return Ok("Kupovina uspešna.");
        }

        [Authorize(Roles = "MobileUser")]
        [HttpGet("tickets/my")]
        public IActionResult GetMyTickets()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            var myTickets = _context.UserTickets
                .Where(ut => ut.UserID == userId)
                .Select(ut => new {
                    ut.TicketID,
                    ut.PurchasedAt,
                    TicketType = ut.Ticket.TypeName,
                    EventName = ut.Ticket.Event.Title,
                    ut.Ticket.Price
                })
                .ToList();

            return Ok(myTickets);
        }
    }
}
