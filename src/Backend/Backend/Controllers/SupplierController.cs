using Backend.Helpers;
using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Supplier")]
    public class SupplierController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly IStringLocalizer<SharedResource> _localizer;

        public SupplierController(AppDbContext context, IWebHostEnvironment env, IStringLocalizer<SharedResource> localizer)
        {
            _context = context;
            _env = env;
            _localizer = localizer;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetSupplier()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            var supplier = await _context.Suppliers
                .FirstOrDefaultAsync(s => s.Id == userId);

            if (supplier == null)
                return NotFound(_localizer["supplier.not_found"]);

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
                return NotFound(new { message = _localizer["supplier.not_found"] });

            
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
                return NotFound(new { message = _localizer["user.not_found"] });

            
            if (!string.IsNullOrEmpty(model.Username) && model.Username != supplier.Username)
            {
                if (await _context.Suppliers.AnyAsync(s => s.Username == model.Username && s.Id != userId))
                    return BadRequest(new { message = _localizer["organizer.username_exists"] });

                supplier.Username = model.Username;
                user.Username = model.Username;
            }

            
            if (!string.IsNullOrEmpty(model.Email) && model.Email != supplier.Email)
            {
                if (!CommonHelpers.IsEmailInValidForm(model.Email))
                    return BadRequest(new { message = _localizer["common.invalid_email"] });
                if (await _context.Suppliers.AnyAsync(s => s.Email == model.Email && s.Id != userId))
                    return BadRequest(new { message = _localizer["common.email_exists"] });

                supplier.Email = model.Email;
                user.Email = model.Email;
            }

            
            if (!string.IsNullOrEmpty(model.PhoneNumber) && model.PhoneNumber != supplier.PhoneNumber)
            {
                if (!CommonHelpers.IsPhoneNumberValid(model.PhoneNumber))
                    return BadRequest(new { message = _localizer["common.invalid_phone"] });
                if (await _context.Suppliers.AnyAsync(s => s.PhoneNumber == model.PhoneNumber && s.Id != userId))
                    return BadRequest(new { message = _localizer["common.phone_exists"] });

                supplier.PhoneNumber = model.PhoneNumber;
                user.PhoneNumber = model.PhoneNumber; // Sinhronizacija sa users tabelom
            }

            
            if (!string.IsNullOrEmpty(model.CompanyName) && model.CompanyName != supplier.CompanyName)
                supplier.CompanyName = model.CompanyName;

            if (!string.IsNullOrEmpty(model.Website) && model.Website != supplier.Website)
                supplier.Website = model.Website;

            if (!string.IsNullOrEmpty(model.CompanyBio) && model.CompanyBio != supplier.CompanyBio)
                supplier.CompanyBio = model.CompanyBio;

            
            _context.Suppliers.Update(supplier);
            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = _localizer["organizer.updated"] });
        }

        [HttpPost("change-supplier-picture")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadSupplierPhoto([FromForm] UploadImageDto model)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            var supplier = await _context.Suppliers.FirstOrDefaultAsync(s => s.Id == userId);
            if (supplier == null)
                return BadRequest(_localizer["supplier.not_found"]);

            
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
                return BadRequest(_localizer["user.not_found"]);

            
            string oldSupplierImage = supplier.Image;
            string oldUserImage = user.ProfilePicture;

            
            string imageName = await CommonHelpers.SaveImageAsync(model.Image, _env);

            
            supplier.Image = imageName;
            _context.Suppliers.Update(supplier);

            
            user.ProfilePicture = imageName;
            _context.Users.Update(user);

            await _context.SaveChangesAsync();

            
            if (!string.IsNullOrEmpty(oldSupplierImage))
                await CommonHelpers.RemovePhoto(oldSupplierImage, _env);

            if (!string.IsNullOrEmpty(oldUserImage) && oldUserImage != oldSupplierImage)
                await CommonHelpers.RemovePhoto(oldUserImage, _env);

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

            await _context.SaveChangesAsync();

            return Ok(_localizer["resources.updated"]);
        }

        [HttpDelete("resource/{id}")]
        public async Task<IActionResult> DeleteResource(int id) //Dodaj u tabelu za logovanje, potrosni idu u log tabelu, ako pokusa da izbrise alociran
        {
            var resource = await _context.Resources.FindAsync(id);
            if (resource == null) return NotFound();
            if (!resource.IsExhaustable && resource.IsAvailable == ResourceAvailability.Booked)
                return BadRequest(_localizer["resources.cannot_delete_booked_inexhaustable"]);
            ResourceLog resourceLog = new ResourceLog
            {
                ResourceID = resource.ResourceID,
                Quantity = resource.Quantity,
                LogDate = DateTime.UtcNow,
                Name = resource.Name,
                Category = resource.Category,
                IsExhaustable = resource.IsExhaustable,
                IsAvailable = resource.IsAvailable,
                Description = resource.Description,
                SupplierID = resource.SupplierID,
            };
            _context.ResourceLog.Add(resourceLog);
            _context.Resources.Remove(resource);
            await _context.SaveChangesAsync();

            return Ok(_localizer["resources.deleted"]);
        }

        [HttpGet("supplier/{supplierId}/eventresources/pending")]
        public async Task<IActionResult> GetPendingRequests(int supplierId)
        {
            var requests = await _context.EventResources
                .Where(er => er.SupplierID == supplierId && er.Status == EventResourceStatus.Pending)
                .Include(er => er.Resource)
                .Include(er => er.Event)
                .ThenInclude(e => e.Organizer)
                .Select(er => new
                {
                    // FIX: Use the correct property name from your model.
                    id = er.ID,
                    quantity = er.Quantity,
                    isReservable = er.IsReservable,
                    startDateTimeBooked = er.StartDateTimeBooked,
                    endDateTimeBooked = er.EndDateTimeBooked,
                    resourceName = er.Resource.Name,
                    eventTitle = er.Event.Title,
                    organizerUsername = er.Event.Organizer.Username
                })
                .ToListAsync();

            return Ok(requests);
        }

        [HttpPut("eventresource/{id}/status")]
        public async Task<IActionResult> UpdateEventResourceStatus(int id, [FromBody] EventResourceStatus newStatus)
        {
            var eventResource = await _context.EventResources.Include(er => er.Resource).FirstOrDefaultAsync(er => er.ID == id);
            if (eventResource == null)
                return NotFound();

            if (eventResource.Status != EventResourceStatus.Pending)
                return BadRequest(_localizer["resources.only_update_pending"]);

            // Logic for Approved status
            if (newStatus == EventResourceStatus.Approved)
            {
                // Only subtract quantity if the original resource is exhaustible.
                if (eventResource.Resource.IsExhaustable)
                {
                    // Check for available quantity before subtracting. This is a crucial final check.
                    if (eventResource.Resource.Quantity < eventResource.Quantity)
                    {
                        // This scenario could happen if another event approved the same resource first.
                        return BadRequest(_localizer["resources.not_enough_quantity_maybe_other_event"]);
                    }

                    // Subtract the quantity from the supplier's resource.
                    eventResource.Resource.Quantity -= eventResource.Quantity;
                }

                // Update IsAvailable status if quantity drops to 0.
                if (eventResource.Resource.Quantity <= 0)
                {
                    eventResource.Resource.IsAvailable = ResourceAvailability.Unavailable;
                }

                _context.Resources.Update(eventResource.Resource);
            }
            else if (newStatus == EventResourceStatus.Declined)
            {
                // Add the quantity back to the supplier's available resources.
                if (eventResource.Resource.IsExhaustable)
                {
                    eventResource.Resource.Quantity += eventResource.Quantity;
                }

                // Ensure the resource is marked as available again.
                eventResource.Resource.IsAvailable = ResourceAvailability.Available;
                _context.Resources.Update(eventResource.Resource);
            }

            // Update the EventResource status and save changes.
            eventResource.Status = newStatus;
            _context.EventResources.Update(eventResource);
            await _context.SaveChangesAsync();

            return Ok(_localizer["resources.status_updated"]);
        }

        [HttpGet("ReusableResources")]
        public async Task<IActionResult> GetSupplierReusableResources()
        {

            var supplierId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
            
            var supplier = await _context.Users
                .FirstOrDefaultAsync(s => s.UserId == supplierId);

            if (supplier == null)
                return NotFound(new { message = _localizer["supplier.not_found"] });

            
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
                })
                .ToListAsync();

            return Ok(reusableResources);
        }

        [HttpGet("booked-resources")]
        public async Task<IActionResult> GetSupplierBookedResources()
        {
            var supplierId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            var bookedResources = await _context.EventResources
                .Where(er => er.SupplierID == supplierId && er.Status == EventResourceStatus.Approved)
                .Include(er => er.Resource)
                .Include(er => er.Event)
                .Where(er => !er.Resource.IsExhaustable)
                .Select(er => new
                {
                    
                    EventResource = new EventResourceDto
                    {
                        ID = er.ID,
                        SupplierID = er.SupplierID,
                        EventID = er.EventID,
                        ResourceID = er.ResourceID,
                        Quantity = er.Quantity,
                        IsReservable = er.IsReservable,
                        Status = er.Status,
                        StartDateTimeBooked = er.StartDateTimeBooked,
                        EndDateTimeBooked = er.EndDateTimeBooked
                    },
                    
                    ResourceName = er.Resource.Name,
                    ResourceCategory = er.Resource.Category,
                    EventTitle = er.Event.Title,
                    ResourceDescription = er.Resource.Description,
                    EventStartDate = er.Event.StartDate,
                    EventEndDate = er.Event.EndDate
                })
                .ToListAsync();

            return Ok(bookedResources);
        }


    }
}
