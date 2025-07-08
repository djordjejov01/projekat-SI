using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ResourceController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ResourceController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{eventId}/resources")]
        public IActionResult GetResourcesForEvent(int eventId)
        {
            var resources = _context.EventResources
                .Where(er => er.EventID == eventId)
                .Select(er => new {
                    er.ID,
                    er.SupplierID,
                    er.EventID,
                    er.Quantity,
                    er.Measure,
                    ResourceName = er.Resource.Name

                })
                .ToList();

            return Ok(resources);
        }

        [HttpPost("reserve")]
        public IActionResult ReserveResource([FromBody] ResourceReservationDto dto)
        {
            if (dto.Quantity <= 0)
                return BadRequest("Količina mora biti veća od nule.");

            var eventResource = _context.EventResources.FirstOrDefault(er => er.ID == dto.EventResourceID);
            if (eventResource == null)
                return NotFound("Resurs ne postoji.");


            int alreadyReserved = _context.UserResourceReservations
                .Where(r => r.EventResourceID == dto.EventResourceID)
                .Sum(r => r.Quantity);

            if (alreadyReserved + dto.Quantity > eventResource.Quantity)
                return BadRequest("Nema dovoljno dostupnih resursa.");


            var reservation = new UserResourceReservation
            {
                UserID = dto.UserID,
                EventResourceID = dto.EventResourceID,
                Quantity = dto.Quantity,
                UserTicketID = dto.UserTicketID,
                ReservedAt = DateTime.UtcNow
            };

            _context.UserResourceReservations.Add(reservation);
            _context.SaveChanges();

            return Ok("Rezervacija uspešna.");
        }


    }
}