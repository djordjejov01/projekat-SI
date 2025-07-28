using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventPinController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EventPinController(AppDbContext context)
        {
            _context = context;
        }

        // Add new pin
        [HttpPost]
        public async Task<IActionResult> CreatePin([FromBody] EventPinDto pin)
        {
            try
            {
                EventPin eventPin = new EventPin
                {
                    EventId = pin.EventId,
                    Latitude = pin.Latitude,
                    Longitude = pin.Longitude,
                    Label = pin.Label,
                    Description = pin.Description,
                    PinnedAt = DateTime.UtcNow
                };
                _context.EventPin.Add(eventPin);
                await _context.SaveChangesAsync();
                return Ok("Event pin saved!");
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }

        }
        [HttpPut]
        public async Task<IActionResult> UpdatePin([FromBody] EventPinDto pin)
        {
            try
            {
                var eventPin = await _context.EventPin.FindAsync(pin.Id);
                if (eventPin == null)
                    return NotFound(new { message = "Event pin not found." });

                eventPin.Latitude = pin.Latitude;
                eventPin.Longitude = pin.Longitude;
                eventPin.Label = pin.Label;
                eventPin.Description = pin.Description;

                await _context.SaveChangesAsync();
                return Ok("Event pin updated!");
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePin(int id)
        {
            try
            {
                var eventPin = await _context.EventPin.FindAsync(id);
                if (eventPin == null)
                    return NotFound(new { message = "Event pin not found." });

                _context.EventPin.Remove(eventPin);
                await _context.SaveChangesAsync();
                return Ok("Event pin deleted!");
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("event/")]
        public async Task<IActionResult> GetPinsForEvent(int eventId)
        {
            try
            {
                var pins = await _context.EventPin
                    .Where(p => p.EventId == eventId)
                    .ToListAsync();

                // If you want to return DTOs (recommended):
                var pinDtos = pins.Select(p => new EventPinDto
                {
                    Id = p.Id,
                    EventId = p.EventId,
                    Latitude = p.Latitude,
                    Longitude = p.Longitude,
                    Label = p.Label,
                    Description = p.Description,
                    PinnedAt = p.PinnedAt
                }).ToList();

                return Ok(pinDtos);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

    }
}
