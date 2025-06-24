using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        // WEB registracija (role je obavezan)
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (string.IsNullOrWhiteSpace(registerDto.Role))
                return BadRequest(new { message = "Role je obavezan za web registraciju." });

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

        // MOBILNA registracija (role se automatski postavlja na Guest)
        [HttpPost("mobile-register")]
        public async Task<IActionResult> MobileRegister([FromBody] RegisterDto registerDto)
        {
            registerDto.Role = "Guest";
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