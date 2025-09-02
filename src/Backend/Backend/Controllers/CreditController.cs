using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CreditController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IStringLocalizer<SharedResource> _localizer;

        public CreditController(AppDbContext context, IStringLocalizer<SharedResource> localizer)
        {
            _context = context;
            _localizer = localizer;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetUserCredit()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound();
            return Ok(new { Credits = user.Credit });
        }

        [Authorize]
        [HttpPost("add")]
        public async Task<IActionResult> AddCredits([FromBody] decimal amount)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound();

            if (user.Credit + amount > 1000000)
            {
                return BadRequest(new { message = _localizer["credit.exceeds_max"] });
            }

            user.Credit += amount;
            await _context.SaveChangesAsync();

            return Ok(new { Credits = user.Credit });
        }
    }
}
