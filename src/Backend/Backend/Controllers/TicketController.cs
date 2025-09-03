using Backend.Helpers;
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
    public class TicketController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IStringLocalizer<SharedResource> _localizer;

        public TicketController(AppDbContext context, IStringLocalizer<SharedResource> localizer)
        {
            _context = context;
            _localizer = localizer;
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
                return NotFound(_localizer["user.not_found"].ToString());

            if (dtos == null || dtos.Count == 0)
                return BadRequest(new { message = _localizer["tickets.at_least_one"].ToString() });

            if (dtos.Any(d => d.TicketID <= 0))
                return BadRequest(new { message = _localizer["tickets.invalid"].ToString() });

            if (dtos.Any(d => d.Quantity <= 0))
                return BadRequest(new { message = _localizer["tickets.min_quantity"].ToString() });


            decimal ukupnaCena = 0;
            foreach (var dto in dtos)
            {
                var ticket = await _context.Tickets.FirstOrDefaultAsync(t => t.TicketID == dto.TicketID);
                if (ticket == null)
                    return NotFound(_localizer["tickets.not_exist", dto.TicketID].ToString());

                var eventEntity = await _context.Events.FirstOrDefaultAsync(e => e.EventID == ticket.EventID);
                if (eventEntity == null)
                    return NotFound(_localizer["tickets.event_not_found", dto.TicketID].ToString());

                if (eventEntity.EndDate < DateTime.UtcNow)
                    return BadRequest(_localizer["tickets.event_passed", eventEntity.Title].ToString());

                if (eventEntity.isFree)
                    return BadRequest(_localizer["tickets.free_event", eventEntity.Title].ToString());

                var userTicketsForEvent = await _context.UserTickets
                    .Include(ut => ut.Ticket)
                    .Where(ut => ut.UserID == userId && ut.Ticket.EventID == ticket.EventID)
                    .CountAsync();

                if (userTicketsForEvent + dto.Quantity > 10)
                    return BadRequest(_localizer["tickets.limit_exceeded", eventEntity.Title, userTicketsForEvent].ToString());


                int sold =await _context.UserTickets.CountAsync(ut => ut.TicketID == dto.TicketID);
                if (sold + dto.Quantity > ticket.Quota)
                    return BadRequest(_localizer["tickets.not_enough_quota", ticket.TypeName].ToString());

                ukupnaCena += ticket.Price * dto.Quantity;
            }

            
            if (user.Credit < ukupnaCena)
                return BadRequest(_localizer["credit.insufficient"].ToString());

            
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
