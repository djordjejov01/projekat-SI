using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CreditController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CreditController(AppDbContext context)
        {
            _context = context;
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

            user.Credit += amount;
            await _context.SaveChangesAsync();

            return Ok(new { Credits = user.Credit });
        }
    }
}
