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
                phoneNumber = user.PhoneNumber,
                profilePicture = user.ProfilePicture
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
            user.ProfilePicture = dto.ProfilePicture;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Profil uspešno izmenjen." });
        }


        [HttpPost("upload-profile-picture")]
        public async Task<IActionResult> UploadProfilePicture([FromForm] UploadImageDto dto)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound("Korisnik nije pronađen.");

            if (dto.Image == null || dto.Image.Length == 0)
                return BadRequest("Slika nije poslata.");

            if (dto.Image.Length > 2 * 1024 * 1024)
                return BadRequest("Slika ne sme biti veća od 2MB.");

            var allowedTypes = new[] { "image/jpeg", "image/png" };
            if (!allowedTypes.Contains(dto.Image.ContentType))
                return BadRequest("Dozvoljeni su samo JPG i PNG fajlovi.");

            var folderPath = Path.Combine("wwwroot", "profile-images");
            Directory.CreateDirectory(folderPath);
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.Image.FileName)}";
            var filePath = Path.Combine(folderPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.Image.CopyToAsync(stream);
            }

            user.ProfilePicture = $"/profile-images/{fileName}";
            await _context.SaveChangesAsync();

            return Ok(new { imageUrl = user.ProfilePicture });
        }
        [HttpDelete("delete-profile-picture")]
        public async Task<IActionResult> DeleteProfilePicture()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound("Korisnik nije pronađen.");

            if (!string.IsNullOrEmpty(user.ProfilePicture))
            {
                var path = Path.Combine("wwwroot", user.ProfilePicture.TrimStart('/'));
                if (System.IO.File.Exists(path))
                    System.IO.File.Delete(path);
            }

            user.ProfilePicture = null;
            await _context.SaveChangesAsync();

            return Ok();
        }


    }
}
