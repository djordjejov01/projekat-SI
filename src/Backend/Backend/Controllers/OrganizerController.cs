using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Helpers;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Organizer")]

    public class OrganizerController : ControllerBase
    {
        private readonly AppDbContext _context;
        public OrganizerController(AppDbContext context)
        {
            _context = context;
        }
        [HttpGet("get-organizer")]
        public async Task<IActionResult> GetOrganizer(int id)
        {
            var Organizer = _context.Organizers.Where(o => o.Id == id).Select(o => new OrganizerDto
            {
                Id = o.Id,
                Username = o.Username,
                Email = o.Email,
                Name = o.Name,
                PhoneNumber = o.PhoneNumber
            }).FirstOrDefault();
            if(Organizer is not null)
                return Ok(Organizer);
            return BadRequest(new { message = "Organizer with that ID does not exist." });
        }
        [HttpPost("update-organizer")]
        public async Task<IActionResult> UpdateOrganizer([FromBody] OrganizerDto model, string newPassword)
        {
            var organizer = _context.Organizers.Where(o => o.Id == model.Id).FirstOrDefault();
            
            if (organizer is null)
            {
                return BadRequest(new { message = "Organizer with that ID does not exist." });
            }
            
            if (model.Name != organizer.Name && !string.IsNullOrEmpty(model.Name))
                organizer.Name = model.Name;

            if (model.Username != organizer.Username)
            {
                if(_context.Organizers.Any(o => o.Username == model.Username))
                {
                    return BadRequest(new { message = "Username already exists." });
                }
                organizer.Username = model.Username;
                
            }
            
            if (model.Email != organizer.Email)
            {
                if (!CommonHelpers.IsEmailInValidForm(model.Email))
                {
                    return BadRequest(new { message = "Invalid email format." });
                }
                if (_context.Organizers.Any(o => o.Email == model.Email))
                {
                    return BadRequest(new { message = "Email already exists." });
                }
                organizer.Email = model.Email;
            }
            
            if (model.PhoneNumber != organizer.PhoneNumber)
            {
                if (!CommonHelpers.IsPhoneNumberValid(model.PhoneNumber))
                {
                    return BadRequest(new { message = "Invalid phone number format." });
                }
                if (_context.Organizers.Any(o => o.PhoneNumber == model.PhoneNumber))
                {
                    return BadRequest(new { message = "Phone number already exists." });
                }
                organizer.PhoneNumber = model.PhoneNumber;
            }
            
            var newHash = CommonHelpers.HashPassword(newPassword);
            
            if(newHash != _context.Users.Where(o => o.UserId == model.Id).FirstOrDefault().Password) // NOTE: ovaj deo je zahtevan u tasku #45 - 2 user je prakticno pri svakoj promeni da menja sifru sem ako nije direktno ubacena cookies
            {
                if (!CommonHelpers.IsPasswordStrong(newPassword))
                {
                    return BadRequest(new { message = "Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, and one digit." });
                }
                _context.Users.Where(o => o.UserId == model.Id).FirstOrDefault().Password = newHash;
            }
            
            await _context.SaveChangesAsync();
            
            return Ok(new {message = "User data successfully changed!"});
        }
    }
}
