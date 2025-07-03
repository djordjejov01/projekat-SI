using Backend.Models;
using Backend.Models.Dto;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]


    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IConfiguration _config;

        public UserController(IUserService userService, IConfiguration config)
        {
            _userService = userService;
            _config = config;
        }

        // WEB registracija (role je obavezan)
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            // Provera validacije modela
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
    }
}