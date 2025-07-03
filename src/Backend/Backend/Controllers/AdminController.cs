using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;
        public AdminController(AppDbContext context)
            => _context = context;

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Select(u => new User
                {
                    UserId = u.UserId,
                    Username = u.Username,
                    Email = u.Email,
                    Role = u.Role,
                    IsActive = u.IsActive,
                    CreationTime = u.CreationTime,
                    LastLoginTime = u.LastLoginTime
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("users/by-role")]
        public async Task<IActionResult> GetAllUsersByRole([FromQuery] UserRole role)
        {
            var users = await _context.Users
                .Where(u => u.Role == role)
                .Select(u => new User
                {
                    UserId = u.UserId,
                    Username = u.Username,
                    Email = u.Email,
                    Role = u.Role,
                    IsActive = u.IsActive,
                    CreationTime = u.CreationTime,
                    LastLoginTime = u.LastLoginTime
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("users/page")]
        public async Task<IActionResult> GetNUsersStartingFromKthId(
            [FromQuery] int n,
            [FromQuery] int k)
        {
            var users = await _context.Users
                .OrderBy(u => u.UserId)
                .Skip(k)
                .Take(n)
                .Select(u => new User
                {
                    UserId = u.UserId,
                    Username = u.Username,
                    Email = u.Email,
                    Role = u.Role,
                    IsActive = u.IsActive,
                    CreationTime = u.CreationTime,
                    LastLoginTime = u.LastLoginTime
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("users/dormant")]
        public async Task<IActionResult> GetDormantUsers()
        {
            var cutoffDate = DateTime.UtcNow.AddMonths(-1);

            var users = await _context.Users
                .Where(u =>
                    !u.IsActive
                    || u.LastLoginTime <= cutoffDate
                )
                .Select(u => new User
                {
                    UserId = u.UserId,
                    Username = u.Username,
                    Email = u.Email,
                    Role = u.Role,
                    IsActive = u.IsActive,
                    CreationTime = u.CreationTime,
                    LastLoginTime = u.LastLoginTime
                })
                .ToListAsync();

            return Ok(users);
        }
        [HttpPut("users/{id}/active")]

        public async Task<IActionResult> SetUserActiveStatus([FromRoute] int id,[FromQuery] bool isActive)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();
            
            user.IsActive = isActive;
            await _context.SaveChangesAsync();

            return Ok(user);
        }
    }
}
