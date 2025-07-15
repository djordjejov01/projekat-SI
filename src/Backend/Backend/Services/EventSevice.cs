using Backend.Models;
using Backend.Models.Dto;

namespace Backend.Services
{
    public class EventSevice : IEventService
    {
        private readonly AppDbContext _context;

        public EventSevice(AppDbContext context)
        {
            _context = context;
        }
        public Task<List<EventListDto>> SearchEvents(string? name, EventCategory? category)
        {
            throw new NotImplementedException();
        }
    }
}
