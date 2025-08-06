using Backend.Helpers;
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
        private readonly IWebHostEnvironment _env;

        public SupplierController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
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

        
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateSupplier([FromBody] UpdateSupplierDto model)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            var supplier = await _context.Suppliers.FirstOrDefaultAsync(s => s.Id == userId);
            if (supplier == null)
                return NotFound(new { message = "Dobavljač nije pronađen." });

            
            if (!string.IsNullOrEmpty(model.CompanyName) && model.CompanyName != supplier.CompanyName)
                supplier.CompanyName = model.CompanyName;

            if (!string.IsNullOrEmpty(model.Username) && model.Username != supplier.Username)
            {
                if (await _context.Suppliers.AnyAsync(s => s.Username == model.Username && s.Id != userId))
                    return BadRequest(new { message = "Korisničko ime već postoji." });
                supplier.Username = model.Username;
            }

            if (!string.IsNullOrEmpty(model.Email) && model.Email != supplier.Email)
            {
                if (!CommonHelpers.IsEmailInValidForm(model.Email))
                    return BadRequest(new { message = "Neispravan format email adrese." });
                if (await _context.Suppliers.AnyAsync(s => s.Email == model.Email && s.Id != userId))
                    return BadRequest(new { message = "Email već postoji." });
                supplier.Email = model.Email;
            }

            if (!string.IsNullOrEmpty(model.PhoneNumber) && model.PhoneNumber != supplier.PhoneNumber)
            {
                if (!CommonHelpers.IsPhoneNumberValid(model.PhoneNumber))
                    return BadRequest(new { message = "Neispravan format broja telefona." });
                if (await _context.Suppliers.AnyAsync(s => s.PhoneNumber == model.PhoneNumber && s.Id != userId))
                    return BadRequest(new { message = "Broj telefona već postoji." });
                supplier.PhoneNumber = model.PhoneNumber;
            }

            if (!string.IsNullOrEmpty(model.Website) && model.Website != supplier.Website)
                supplier.Website = model.Website;

            if (!string.IsNullOrEmpty(model.CompanyBio) && model.CompanyBio != supplier.CompanyBio)
                supplier.CompanyBio = model.CompanyBio;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Podaci dobavljača su uspešno ažurirani!" });
        }

        [HttpPost("change-supplier-picture")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadSupplierPhoto([FromForm] UploadImageDto model)
        {
           
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            var supplier = await _context.Suppliers.FirstOrDefaultAsync(s => s.Id == userId);
            if (supplier == null)
                return BadRequest("Supplier not found!");

           
            string imageName = await CommonHelpers.SaveImageAsync(model.Image, _env);

            
            await CommonHelpers.RemovePhoto(supplier.Image, _env);

            
            supplier.Image = imageName;
            _context.Suppliers.Update(supplier);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet("Resources")]
        public async Task<IActionResult> GetSupplierResources()
        {

            var supplierId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
            
            var supplier = await _context.Suppliers
                .FirstOrDefaultAsync(s => s.Id == supplierId);

            if (supplier == null)
                return NotFound("Dobavljač nije pronađen.");

            
            var resources = await _context.Resources
                .Where(r => r.SupplierID == supplierId)
                .Select(r => new
                {
                    resourceId = r.ResourceID,
                    name = r.Name,
                    description = r.Description,
                    quantity = r.Quantity,
                    supplierId = r.SupplierID
                })
                .ToListAsync();

            return Ok(resources);
        }


    }
}
