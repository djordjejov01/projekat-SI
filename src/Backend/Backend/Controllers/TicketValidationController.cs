using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TicketValidationController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IStringLocalizer<SharedResource> _localizer;

        public TicketValidationController(AppDbContext context, IStringLocalizer<SharedResource> localizer)
        {
            _context = context;
            _localizer = localizer;
        }

        [HttpGet("validate/{userTicketId}/{token}")]
        public async Task<IActionResult> ValidateTicket(int userTicketId, string token)
        {
            
            var userTicket = await _context.UserTickets
                .Include(ut => ut.Ticket)
                .Include(ut => ut.User)
                .FirstOrDefaultAsync(ut => ut.UserTicketID == userTicketId);

            if (userTicket == null)
            {
                return NotFound(new TicketValidationDto
                {
                    Status = "invalid",
                    Message = _localizer["ticket_validation.not_found"].ToString()
                });
            }

           
            if (userTicket.ValidationToken != token)
            {
                return BadRequest(new TicketValidationDto
                {
                    Status = "invalid",
                    Message = _localizer["ticket_validation.invalid_token"].ToString()
                });
            }

            
            if (userTicket.IsUsed)
            {
                return Ok(new TicketValidationDto
                {
                    Status = "invalid",
                    Message = string.Format(_localizer["ticket_validation.already_used"].ToString(), userTicket.UsedAt?.ToString("HH:mm:ss")),
                    UsedAt = userTicket.UsedAt
                });
            }

            
            userTicket.IsUsed = true;
            userTicket.UsedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new TicketValidationDto
            {
                Status = "valid",
                Message = _localizer["ticket_validation.valid"].ToString()
            });
        }
    }
}

