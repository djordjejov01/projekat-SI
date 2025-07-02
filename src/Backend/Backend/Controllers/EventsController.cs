using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EventsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("api/events")]
        public async Task<ActionResult<IEnumerable<EventListDto>>> GetUpcomingEvents()
        {
            var now=DateTime.Now;

            var events = await _context.Events
                .Where(e => e.StartDate > now)
                .OrderBy(e => e.StartDate)
                .Select(e => new EventListDto
                {
                    Id = e.EventID,
                    Title = e.Title,
                    Location = e.Location,
                    StartDate = e.StartDate,
                    ImageUrl = e.ImageUrl,
                    AttendingCount = _context.UserTickets
                        .Include(ut => ut.Ticket)
                        .Count(ut => ut.Ticket.EventID == e.EventID)
                })
                .ToListAsync();

            return Ok(events);
        }
    }
}
