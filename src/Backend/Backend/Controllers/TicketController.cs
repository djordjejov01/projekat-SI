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
    public class TicketController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TicketController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("events/{eventId}/tickets")]
        public async Task<IActionResult> GetTicketsForEvent(int eventId)
        {
            var tickets = await _context.Tickets
                .Where(t => t.EventID == eventId)
                .Select(t => new {
                    t.TicketID,
                    t.TypeName,
                    t.Description,
                    t.Price,
                    t.Quota,
                    Available = t.Quota - _context.UserTickets.Count(ut => ut.TicketID == t.TicketID)
                })
                .ToListAsync();

            return Ok(tickets);
        }

        
        [Authorize(Roles = "MobileUser")]
        [HttpPost("purchase")]
        public async Task<IActionResult> PurchaseTicket([FromBody] List<PurchaseTicketDto> dtos)
        {

            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
                return NotFound("Korisnik nije pronađen.");

            
            decimal ukupnaCena = 0;
            foreach (var dto in dtos)
            {
                var ticket = await _context.Tickets.FirstOrDefaultAsync(t => t.TicketID == dto.TicketID);
                if (ticket == null)
                    return NotFound($"Ulaznica sa ID {dto.TicketID} ne postoji.");

                var eventEntity = await _context.Events.FirstOrDefaultAsync(e => e.EventID == ticket.EventID);
                if (eventEntity == null)
                    return NotFound($"Događaj za ulaznicu {dto.TicketID} nije pronađen.");

                if (eventEntity.EndDate < DateTime.UtcNow)
                    return BadRequest($"Nije moguće kupiti kartu za događaj {eventEntity.Title} koji je već prošao.");

                if (eventEntity.isFree)
                    return BadRequest($"Nije moguće kupiti kartu za besplatan događaj ({eventEntity.Title}).");

                int sold =await _context.UserTickets.CountAsync(ut => ut.TicketID == dto.TicketID);
                if (sold + dto.Quantity > ticket.Quota)
                    return BadRequest($"Nema dovoljno dostupnih ulaznica za tip {ticket.TypeName}.");

                ukupnaCena += ticket.Price * dto.Quantity;
            }

            
            if (user.Credit < ukupnaCena)
                return BadRequest("Nedovoljno kredita za kupovinu.");

            
            using (var transaction =await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    
                    user.Credit -= ukupnaCena;
                    await _context.SaveChangesAsync();

                    var createdTickets = new List<object>();

                    
                    foreach (var dto in dtos)
                    {
                        for (int i = 0; i < dto.Quantity; i++)
                        {
                            var userTicket = new UserTicket
                            {
                                UserID = userId,
                                TicketID = dto.TicketID,
                                PurchasedAt = DateTime.UtcNow
                            };
                            _context.UserTickets.Add(userTicket);
                            await _context.SaveChangesAsync();

                            createdTickets.Add(new { UserTicketID = userTicket.UserTicketID, TicketID = dto.TicketID });
                        }
                    }

                    transaction.CommitAsync();
                    return Ok(createdTickets);
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
        }

        [Authorize(Roles = "MobileUser")]
        [HttpGet("tickets/my")]
        public async Task<IActionResult> GetMyTickets()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            var myTickets =await _context.UserTickets
                .Where(ut => ut.UserID == userId)
                .Select(ut => new {
                    ut.UserTicketID,
                    ut.TicketID,
                    ut.PurchasedAt,
                    TicketType = ut.Ticket.TypeName,
                    EventName = ut.Ticket.Event.Title,
                    EventID = ut.Ticket.Event.EventID,
                    ut.Ticket.Price
                })
                .ToListAsync();

            return Ok(myTickets);
        }
    }
}
