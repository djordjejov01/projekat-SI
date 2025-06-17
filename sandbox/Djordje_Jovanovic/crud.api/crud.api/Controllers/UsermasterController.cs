using crud.api.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace crud.api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsermasterController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsermasterController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/users
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var users = await _context.Users.ToListAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/users/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                    return NotFound();

                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/users
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] UserModel user)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                // Provera jedinstvenosti za mobile
                bool mobileExists = await _context.Users.AnyAsync(u => u.mobile == user.mobile);
                if (mobileExists)
                {
                    ModelState.AddModelError("mobile", "Mobile number must be unique.");
                    return BadRequest(ModelState);
                }

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Vraćamo 201 Created sa lokacijom novog korisnika
                return CreatedAtAction(nameof(GetById), new { id = user.userId }, user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UserModel updatedUser)
        {
            if (id != updatedUser.userId)
                return BadRequest("User ID mismatch.");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var existingUser = await _context.Users.FindAsync(id);
                if (existingUser == null)
                    return NotFound();

                // Provera da li je mobile jedinstven (osim za trenutnog korisnika)
                bool mobileExists = await _context.Users.AnyAsync(u => u.mobile == updatedUser.mobile && u.userId != id);
                if (mobileExists)
                {
                    ModelState.AddModelError("mobile", "Mobile number must be unique.");
                    return BadRequest(ModelState);
                }

                // Update polja
                existingUser.email = updatedUser.email;
                existingUser.mobile = updatedUser.mobile;
                existingUser.city = updatedUser.city;
                existingUser.state = updatedUser.state;
                existingUser.address = updatedUser.address;

                await _context.SaveChangesAsync();

                return NoContent(); // 204 No Content
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                    return NotFound();

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                return NoContent(); // 204 No Content
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
