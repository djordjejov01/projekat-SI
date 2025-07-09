using Backend.Helpers;
using Backend.Models;
using Backend.Models.Dto;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]


    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IConfiguration _config;
        private readonly AppDbContext _context;
        public UserController(IUserService userService, IConfiguration config, AppDbContext context)
        {
            _userService = userService;
            _config = config;
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (registerDto.Password != registerDto.ConfirmPassword)
                return BadRequest(new { message = "Lozinka i potvrda lozinke se ne poklapaju." });

            try
            {
                var user = await _userService.RegisterAsync(registerDto);
                return Ok(user);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                var user = await _userService.LoginAsync(loginDto);
                var claims = new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Email, user.Email),    
                    new Claim(ClaimTypes.Role, user.Role.ToString()),

                };
                var key = new SymmetricSecurityKey(
                              Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
                var credsSigning = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                // 4) Create the token
                var token = new JwtSecurityToken(
                    issuer: _config["Jwt:Issuer"],
                    audience: _config["Jwt:Audience"],
                    claims: claims,
                    expires: DateTime.UtcNow.AddHours(2),
                    signingCredentials: credsSigning
                );
                return Ok(new
                {
                    token = new JwtSecurityTokenHandler().WriteToken(token)
                });
                return Ok(user);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        [HttpPost("approve-supplier/{userId}")]
        public async Task<IActionResult> ApproveSupplier(int userId)
        {
            try
            {
                var result = await _userService.ApproveSupplierAsync(userId);
                return Ok(new { success = result });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("SetLanguage")]
        public async Task<IActionResult> SetLanguage([FromBody] SetLanguageDto languageDto)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound();

            user.Language = languageDto.Language;
            await _context.SaveChangesAsync();

            return Ok();
        }

        [Authorize(Roles ="MobileUser")]
        [HttpGet("reservations")]
        public IActionResult GetUserReservations()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            var reservations = _context.UserResourceReservations
                .Where(r => r.UserID == userId)
                .Select(r => new {
                    r.Id,
                    r.EventResourceID,
                    r.Quantity,
                    r.ReservedAt,
                    ResourceName = r.EventResource.Resource.Name,
                    EventName = r.EventResource.Event.Title
                })
                .ToList();

            return Ok(reservations);
        }

        [Authorize(Roles = "MobileUser")]
        [HttpGet("profile")]
        public IActionResult GetProfile()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            var user = _context.Users.FirstOrDefault(u => u.UserId == userId);
            if (user == null)
                return NotFound("Korisnik nije pronađen.");

            return Ok(new {
                firstName = user.FirstName,
                lastName = user.LastName,
                email = user.Email,
                phoneNumber = user.PhoneNumber
            });
        }

        [Authorize(Roles = "MobileUser")]
        [HttpPut("profileUpdate")]
        public IActionResult UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
            var user = _context.Users.FirstOrDefault(u => u.UserId == userId);
            if (user == null)
                return NotFound("Korisnik nije pronađen.");

            
            if (_context.Users.Any(u => u.Email == dto.Email && u.UserId != userId))
                return BadRequest("Korisnik sa ovom email adresom već postoji.");

            if (string.IsNullOrWhiteSpace(dto.Email) || !Regex.IsMatch(dto.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                return BadRequest("Neispravan format email adrese.");

            if (!string.IsNullOrWhiteSpace(dto.PhoneNumber) && !Regex.IsMatch(dto.PhoneNumber, @"^[+]?\d[\d\s-]{5,19}$"))
                return BadRequest("Neispravan format broja telefona.");

            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            user.Email = dto.Email;
            user.PhoneNumber = dto.PhoneNumber;

            _context.SaveChanges();
            return Ok("Profil uspešno izmenjen.");
        }


        [Authorize]
        [HttpPut("change-password")]
        public IActionResult ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
            var user = _context.Users.FirstOrDefault(u => u.UserId == userId);
            if (user == null)
                return NotFound("Korisnik nije pronađen.");

            
            if (CommonHelpers.HashPassword(dto.CurrentPassword) != user.Password)
                return BadRequest("Trenutna lozinka nije ispravna.");

            
            if (string.IsNullOrWhiteSpace(dto.NewPassword) || dto.NewPassword.Length < 8 ||
                !dto.NewPassword.Any(char.IsUpper) ||
                !dto.NewPassword.Any(char.IsLower) ||
                !dto.NewPassword.Any(char.IsDigit))
                return BadRequest("Nova lozinka mora imati bar 8 karaktera, veliko i malo slovo i cifru.");

            
            user.Password = CommonHelpers.HashPassword(dto.NewPassword);
            _context.SaveChanges();
            return Ok("Lozinka uspešno promenjena.");
        }

    }
}