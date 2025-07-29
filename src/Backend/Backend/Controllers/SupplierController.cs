using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Supplier")]
    public class SupplierController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SupplierController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetSupplier()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            var supplier = await _context.Suppliers
                .FirstOrDefaultAsync(s => s.Id == userId);

            if (supplier == null)
                return NotFound("Dobavljač nije pronađen.");

            var dto = new SupplierDto
            {
                Id = supplier.Id,
                Username=supplier.Username,
                CompanyName = supplier.CompanyName,
                Email = supplier.Email,
                PhoneNumber = supplier.PhoneNumber,
                Website = supplier.Website,
                CompanyBio = supplier.CompanyBio,
                Image = supplier.Image
            };

            return Ok(dto);
        }
    }
}
