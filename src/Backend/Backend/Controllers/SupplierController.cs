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

        [HttpGet("resources")]
        public async Task<IActionResult> GetResources([FromQuery] int supplierId)
        {
            var resources = await _context.Resources
                .Where(r => r.SupplierID == supplierId)
                .ToListAsync();

            var dtos = resources.Select(r => new ResourceDto
            {
                ResourceID = r.ResourceID,
                Name = r.Name,
                Category = r.Category,
                IsExhaustable = r.IsExhaustable,
                IsAvailable = r.IsAvailable,
                Description = r.Description,
                SupplierID = r.SupplierID,
                Quantity = r.Quantity,
                Measurment = r.Measurment,
            }).ToList();

            return Ok(dtos);
        }

        [HttpPost("resource")]
        public async Task<IActionResult> CreateResource([FromBody] ResourceDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var resource = new Resource
            {
                Name = dto.Name,
                Category = dto.Category,
                IsExhaustable = dto.IsExhaustable,
                IsAvailable = dto.IsAvailable,
                Description = dto.Description,
                SupplierID = dto.SupplierID,
                Quantity = dto.Quantity,
                Measurment = dto.Measurment,
            };

            _context.Resources.Add(resource);
            await _context.SaveChangesAsync();

            dto.ResourceID = resource.ResourceID;

            return Ok(dto);
        }

        [HttpPut("resource/{id}")]
        public async Task<IActionResult> UpdateResource(int id, [FromBody] ResourceDto dto)
        {
            var resource = await _context.Resources.FindAsync(id);
            if (resource == null) return NotFound();

            resource.Name = dto.Name;
            resource.Category = dto.Category;
            resource.IsExhaustable = dto.IsExhaustable;
            resource.IsAvailable = dto.IsAvailable;
            resource.Description = dto.Description;
            resource.SupplierID = dto.SupplierID;
            resource.Quantity = dto.Quantity;
            resource.Measurment = dto.Measurment;

            await _context.SaveChangesAsync();

            return Ok("Resource updated!");
        }

        [HttpDelete("resource/{id}")]
        public async Task<IActionResult> DeleteResource(int id)
        {
            var resource = await _context.Resources.FindAsync(id);
            if (resource == null) return NotFound();

            _context.Resources.Remove(resource);
            await _context.SaveChangesAsync();

            return Ok("Resource deleted!");
        }

        [HttpGet("supplier/{supplierId}/eventresources/pending")]
        public async Task<IActionResult> GetPendingRequests(int supplierId)
        {
            var requests = await _context.EventResources
                .Where(er => er.SupplierID == supplierId && er.Status == EventResourceStatus.Pending)
                .Include(er => er.Resource)
                .ToListAsync();

            return Ok(requests);
        }

        [HttpPut("eventresource/{id}/status")]
        public async Task<IActionResult> UpdateEventResourceStatus(int id, [FromBody] EventResourceStatus newStatus)
        {
            var eventResource = await _context.EventResources
                .Include(er => er.Resource)
                .FirstOrDefaultAsync(er => er.ID == id);

            if (eventResource == null)
                return NotFound();

            if (eventResource.Status != EventResourceStatus.Pending)
                return BadRequest("Can only update pending requests.");
            var resource = await _context.Resources.FindAsync(eventResource.ResourceID);

            if (newStatus == EventResourceStatus.Approved)
            {
                // Smanji količinu resursa
                if (resource.Quantity < eventResource.Quantity)
                    return BadRequest("Not enough quantity available.");

                resource.Quantity -= eventResource.Quantity;
                _context.Resources.Update(resource);
            }
            eventResource.Status = newStatus;
            await _context.SaveChangesAsync();

            return Ok("Status updated.");
        }

        [HttpGet("resource-categories")]
        public IActionResult GetResourceCategories()
        {
            var categories = Enum.GetValues(typeof(ResourceCategory))
                .Cast<ResourceCategory>()
                .Select(c => new {
                    Id = (int)c,
                    Name = c.ToString()
                });
            return Ok(categories);
        }

        [HttpGet("availabilities")]
        public IActionResult GetAvailabilities()
        {
            var avs = Enum.GetValues(typeof(ResourceAvailability))
                .Cast<ResourceAvailability>()
                .Select(a => new {
                    Id = (int)a,
                    Name = a.ToString()
                });
            return Ok(avs);
        }


        [HttpGet("measure-units")]
        public async Task<IActionResult> GetMeasureUnits()
        {
            var measures = Enum.GetValues(typeof(ResourceAvailability))
                .Cast<ResourceMeasurment>()
                .Select(a => new {
                    Id = (int)a,
                    Name = a.ToString()
                });
            return Ok(measures);
        }


        [HttpGet("ReusableResources")]
        public async Task<IActionResult> GetSupplierReusableResources()
        {

            var supplierId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
            
            var supplier = await _context.Suppliers
                .FirstOrDefaultAsync(s => s.Id == supplierId);

            if (supplier == null)
                return NotFound(new { message = "Dobavljač nije pronađen." });

            
            var reusableResources = await _context.Resources
                .Where(r => r.SupplierID == supplierId && !r.IsExhaustable)
                .Select(r => new ResourceDto
                {
                    ResourceID = r.ResourceID,
                    Name = r.Name,
                    Category = r.Category,
                    IsExhaustable = r.IsExhaustable,
                    IsAvailable = r.IsAvailable,
                    Description = r.Description,
                    SupplierID = r.SupplierID,
                    Quantity = r.Quantity,
                    Supplier = r.Supplier
                })
                .ToListAsync();

            return Ok(reusableResources);
        }


    }
}
