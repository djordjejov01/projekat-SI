using Backend.Models;
using Backend.Models.Dto;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class EventService : IEventService
    {
        private readonly AppDbContext _context;

        public EventService(AppDbContext context)
        {
            _context = context;
        }
        public async Task<List<EventListDto>> SearchEventsAsync(string? name, EventCategory? category)
        {
            var query = _context.Events.AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(e => e.Title.ToLower().Contains(name.ToLower()));
            }

            if (category.HasValue)
            {
                query = query.Where(e => e.Category == category.Value);
            }

            var attendingCounts = await _context.UserTickets
                .GroupBy(ut => ut.Ticket.EventID)
                .Select(g => new { EventID = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.EventID, x => x.Count);

            return await query
                .OrderBy(e => e.StartDate)
                .Select(e => new EventListDto
                {
                    Id = e.EventID,
                    Title = e.Title,
                    Location = e.Location,
                    StartDate = e.StartDate,
                    ImageUrl = e.ImageUrl,
                    Category = e.Category,
                    AttendingCount = attendingCounts.ContainsKey(e.EventID) ? attendingCounts[e.EventID] : 0

                })
                .ToListAsync();
        }
    }
}
