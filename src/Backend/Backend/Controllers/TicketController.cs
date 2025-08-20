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
                .Where(t => t.EventID == eventId && t.validUntil.Date > DateTime.UtcNow.Date)
                .Select(t => new {
                    t.TicketID,
                    t.TypeName,
                    t.Description,
                    t.Price,
                    t.Quota,
                    t.validUntil,
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
                return NotFound("User not found.");

            
            decimal ukupnaCena = 0;
            foreach (var dto in dtos)
            {
                var ticket = await _context.Tickets.FirstOrDefaultAsync(t => t.TicketID == dto.TicketID);
                if (ticket == null)
                    return NotFound($"Ticket with ID {dto.TicketID} does not exist.");

                var eventEntity = await _context.Events.FirstOrDefaultAsync(e => e.EventID == ticket.EventID);
                if (eventEntity == null)
                    return NotFound($"Event for ticket {dto.TicketID} not found.");

                if (eventEntity.EndDate < DateTime.UtcNow)
                    return BadRequest($"It is not possible to purchase a ticket for the event {eventEntity.Title} that has already passed.");

                if (eventEntity.isFree)
                    return BadRequest($"It is not possible to purchase a ticket for a free event ({eventEntity.Title}).");

                var userTicketsForEvent = await _context.UserTickets
                    .Include(ut => ut.Ticket)
                    .Where(ut => ut.UserID == userId && ut.Ticket.EventID == ticket.EventID)
                    .CountAsync();

                if (userTicketsForEvent + dto.Quantity > 10)
                    return BadRequest($"You cannot purchase more than 10 tickets for the event {eventEntity.Title}. You already have {userTicketsForEvent} tickets.");


                int sold =await _context.UserTickets.CountAsync(ut => ut.TicketID == dto.TicketID);
                if (sold + dto.Quantity > ticket.Quota)
                    return BadRequest($"Not enough available tickets for type {ticket.TypeName}.");

                ukupnaCena += ticket.Price * dto.Quantity;
            }

            
            if (user.Credit < ukupnaCena)
                return BadRequest("Insufficient credit for purchase.");

            
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
                                PurchasedAt = DateTime.UtcNow,
                                IsUsed = false,
                                UsedAt = null,
                                ValidationToken = CommonHelpers.GenerateValidationToken()
                            };
                            _context.UserTickets.Add(userTicket);
                        }
                    }
                    await _context.SaveChangesAsync();

                    
                    foreach (var dto in dtos)
                    {
                        for (int i = 0; i < dto.Quantity; i++)
                        {
                            
                            var lastUserTicket = await _context.UserTickets
                                .Where(ut => ut.UserID == userId && ut.TicketID == dto.TicketID)
                                .OrderByDescending(ut => ut.UserTicketID)
                                .FirstOrDefaultAsync();

                            if (lastUserTicket != null)
                            {
                                createdTickets.Add(new { UserTicketID = lastUserTicket.UserTicketID, TicketID = dto.TicketID });
                            }
                        }
                    }

                    await transaction.CommitAsync();
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
                .Select(ut => new
                {
                    ut.UserTicketID,
                    ut.TicketID,
                    ut.PurchasedAt,
                    TicketType = ut.Ticket.TypeName,
                    EventName = ut.Ticket.Event.Title,
                    EventID = ut.Ticket.Event.EventID,
                    ut.Ticket.Price,
                    ut.ValidationToken
                })
                .ToListAsync();

            return Ok(myTickets);
        }
    }
}
