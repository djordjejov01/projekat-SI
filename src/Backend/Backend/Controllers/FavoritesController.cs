using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FavoritesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FavoritesController(AppDbContext context)
        {
            _context = context;
        }

        [Authorize(Roles = "MobileUser")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventListDto>>> GetFavorites()
        {

            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            var favoriteEvents = await _context.FavoriteEvents
                .Where(f => f.UserId == userId)
                .Include(f => f.Event)
                .Select(f => new EventListDto
                {
                    Id = f.Event.EventID,
                    Title = f.Event.Title,
                    Location = f.Event.Location,
                    StartDate = f.Event.StartDate,
                    ImageUrl = f.Event.ImageUrl,
                    Category = f.Event.Category,
                    AttendingCount = _context.UserTickets.Count(ut => ut.Ticket.EventID == f.Event.EventID)
                })
                .ToListAsync();

            return Ok(favoriteEvents);
        }

        [Authorize(Roles = "MobileUser")]
        [HttpPost]
        public async Task<IActionResult> AddFavorite([FromBody] int eventId)
        {


            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            var exists = await _context.FavoriteEvents.AnyAsync(f => f.UserId == userId && f.EventId == eventId);
            if (exists)
                return BadRequest("Event is already in favorites.");

            var favorite = new FavoriteEvent
            {
                UserId = userId,
                EventId = eventId
            };

            _context.FavoriteEvents.Add(favorite);
            await _context.SaveChangesAsync();

            return StatusCode(201);
        }

        [Authorize(Roles = "MobileUser")]
        [HttpDelete]
        public async Task<IActionResult> RemoveFavorite([FromBody] int eventId)
        {

            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
            var favorite = await _context.FavoriteEvents
                .FirstOrDefaultAsync(f => f.UserId == userId && f.EventId == eventId);

            if (favorite == null)
                return NotFound();

            _context.FavoriteEvents.Remove(favorite);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}