using Backend.Helpers;
using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "MobileUser")]
    public class MobileUserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MobileUserController(AppDbContext context)
        {
            _context = context;
        }


        [HttpGet("reservations")]
        public async Task<IActionResult> GetUserReservations()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            var reservations = await _context.UserResourceReservations
                .Where(r => r.UserID == userId)
                .Select(r => new {
                    r.Id,
                    r.EventResourceID,
                    r.Quantity,
                    r.ReservedAt,
                    ResourceName = r.EventResource.Resource.Name,
                    EventName = r.EventResource.Event.Title
                })
                .ToListAsync();

            return Ok(reservations);
        }

        
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            var user =await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
                return NotFound("Korisnik nije pronađen.");

            return Ok(new
            {
                firstName = user.FirstName,
                lastName = user.LastName,
                email = user.Email,
                phoneNumber = user.PhoneNumber
            });
        }

        
        [Authorize]
        [HttpPut("profileUpdate")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
                return NotFound(new { message = "Korisnik nije pronađen." });

            if (_context.Users.Any(u => u.Email == dto.Email && u.UserId != userId))
                return BadRequest(new { message = "Korisnik sa ovom email adresom već postoji." });

            if (string.IsNullOrWhiteSpace(dto.Email) || !CommonHelpers.IsEmailInValidForm(dto.Email))
                return BadRequest(new { message = "Neispravan format email adrese." });

            if (!string.IsNullOrWhiteSpace(dto.PhoneNumber) && !CommonHelpers.IsPhoneNumberValid(dto.PhoneNumber))
                return BadRequest(new { message = "Neispravan format broja telefona." });

            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            user.Email = dto.Email;
            user.PhoneNumber = dto.PhoneNumber;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Profil uspešno izmenjen." });
        }

        [HttpGet("event/{eventId}")]
        public async Task<IActionResult> GetPinsForPublishedEvent(int eventId)
        {
            try
            {
                
                var eventExists = await _context.Events
                    .AnyAsync(e => e.EventID == eventId && e.Status==EventStatus.Published);

                if (!eventExists)
                {
                    return NotFound(new { message = "Događaj nije pronađen." });
                }

                var pins = await _context.EventPin
                    .Where(p => p.EventId == eventId)
                    .ToListAsync();

                
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

    }
}
