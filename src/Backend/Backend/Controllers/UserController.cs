using Backend.Helpers;
using Backend.Models;
using Backend.Models.Dto;
using Backend.Services;
using Backend.Services.Email;
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
        private readonly IWebHostEnvironment _env;
        public UserController(IUserService userService, IConfiguration config, AppDbContext context, IWebHostEnvironment env)
        {
            _userService = userService;
            _config = config;
            _context = context;
            _env = env;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (registerDto.Password != registerDto.ConfirmPassword)
                return BadRequest(new { message = "Password and password confirmation do not match." });

            
            if (registerDto.Role != UserRole.Organizer && registerDto.Role != UserRole.Supplier && registerDto.Role != UserRole.MobileUser)
                return BadRequest(new { message = "Role not allowed for public registration." });

            try
            {
                var user = await _userService.RegisterAsync(registerDto);

                return Ok(new{
                    message = "Registration successful. Please check your email to verify your account.",
                    user = user,
                    requiresEmailVerification = true
                });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("register-web")]
        public async Task<IActionResult> RegisterWeb([FromBody] RegisterWebDto registerDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (registerDto.Password != registerDto.ConfirmPassword)
                return BadRequest(new { message = "Password and confirmation password do not match." });

            if (registerDto.Role != UserRole.Organizer && registerDto.Role != UserRole.Supplier)
                return BadRequest(new { message = "Role not allowed for public registration." });

            try
            {
                var user = await _userService.RegisterWebAsync(registerDto);
                return Ok(new{
                    message = "Registration successful. Please check your email to verify your account.",
                    user = user,
                    requiresEmailVerification = true
                });
            }
            catch (Exception ex)
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
                if (!user.IsEmailVerified)
                {
                    return BadRequest(new { message = "Email address not verified. Please check your email and verify your account." });
                }
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
                    expires: DateTime.UtcNow.AddHours(720),
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

        [Authorize]
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
            var user =await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
                return NotFound(new { message = "User not found." });

            
            if (CommonHelpers.HashPassword(dto.CurrentPassword) != user.Password)
                return BadRequest(new { message = "The current password is incorrect." });

            
            if (string.IsNullOrWhiteSpace(dto.NewPassword) || dto.NewPassword.Length < 8 ||
                !dto.NewPassword.Any(char.IsUpper) ||
                !dto.NewPassword.Any(char.IsLower) ||
                !dto.NewPassword.Any(char.IsDigit))
                return BadRequest(new { message = "The new password must be at least 8 characters long and include an uppercase letter, a lowercase letter, and a number." });

            
            user.Password = CommonHelpers.HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Password changed successfully." });
        }

        [Authorize]
        [HttpGet("role")]
        public async Task<IActionResult> GetUserRole()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound();

            return Ok(new { role = user.Role.ToString() });
        }

        [Authorize(Roles = "Organizer,Supplier,Admin")]
        [HttpDelete("delete-profile-picture")]
        public async Task<IActionResult> DeleteProfilePicture()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
                return NotFound(new { message = "User not found." });

            if (!string.IsNullOrEmpty(user.ProfilePicture))
            {
                // Assume user.ProfilePicture is stored like "/profile-images/filename.jpg"
                var relativePath = user.ProfilePicture.TrimStart('/');
                var absolutePath = Path.Combine(_env.WebRootPath, relativePath);

                if (System.IO.File.Exists(absolutePath))
                {
                    try
                    {
                        System.IO.File.Delete(absolutePath);
                    }
                    catch (Exception ex)
                    {
                        return StatusCode(500, new { message = "Error deleting image:" + ex.Message });
                    }
                }

                
            }
            const string defaultImagePath = "images/default-pfp.png";
            user.ProfilePicture = defaultImagePath;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Profile picture deleted.",imageUrl=defaultImagePath });
        }

    }
}