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
    public class EventPinController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IStringLocalizer<SharedResource> _localizer;

        public EventPinController(AppDbContext context, IStringLocalizer<SharedResource> localizer)
        {
            _context = context;
            _localizer = localizer;
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
                    PinnedAt = DateTime.UtcNow,
                    PinCategory = pin.PinCategory
                };
                _context.EventPin.Add(eventPin);
                await _context.SaveChangesAsync();
                return Ok(_localizer["eventpin.saved"].Value);
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
                    return NotFound(new { message = _localizer["eventpin.not_found"].Value });

                eventPin.Latitude = pin.Latitude;
                eventPin.Longitude = pin.Longitude;
                eventPin.Label = pin.Label;
                eventPin.Description = pin.Description;
                eventPin.PinCategory = pin.PinCategory;

                await _context.SaveChangesAsync();
                return Ok(_localizer["eventpin.updated"].Value);
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
                    return NotFound(new { message = _localizer["eventpin.not_found"].Value });

                _context.EventPin.Remove(eventPin);
                await _context.SaveChangesAsync();
                return Ok(_localizer["eventpin.deleted"].Value);
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
                    PinnedAt = p.PinnedAt,
                    PinCategory = p.PinCategory
                }).ToList();

                return Ok(pinDtos);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("categories")]
        public IActionResult GetPinCategories()
        {
            var values = Enum.GetValues(typeof(PinTypes))
                .Cast<PinTypes>()
                .Select(e => new { Id = (int)e, Name = e.ToString() });

            return Ok(values);
        }

    }
}
