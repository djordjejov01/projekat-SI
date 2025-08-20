using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TicketValidationController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TicketValidationController(AppDbContext context)
        {
            _context = context;
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
                    Message = "Ticket not found."
                });
            }

           
            if (userTicket.ValidationToken != token)
            {
                return BadRequest(new TicketValidationDto
                {
                    Status = "invalid",
                    Message = "Invalid validation token."
                });
            }

            
            if (userTicket.IsUsed)
            {
                return Ok(new TicketValidationDto
                {
                    Status = "invalid",
                    Message = $"The ticket has already been used at {userTicket.UsedAt:HH:mm:ss}.",
                    UsedAt = userTicket.UsedAt
                });
            }

            
            userTicket.IsUsed = true;
            userTicket.UsedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new TicketValidationDto
            {
                Status = "valid",
                Message = "The ticket is valid. Welcome to the event!"
            });
        }
    }
}

