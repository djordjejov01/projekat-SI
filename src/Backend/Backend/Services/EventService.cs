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
        public async Task<List<EventListDto>> SearchEventsAsync(string? name, EventCategory? category, string? location,bool? isFree,
            DateTime? startDate,DateTime? endDate,bool? hasTickets,string? sortOrder,string? sortBy)
        {
            var query = _context.Events.AsQueryable();

            
            query = query.Where(e => e.EndDate >= DateTime.UtcNow);
            query = query.Where(e => e.Status == EventStatus.Published);

            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(e => e.Title.ToLower().Contains(name.ToLower()));
            }

            if (category.HasValue)
            {
                query = query.Where(e => e.Category == category.Value);
            }

            if (!string.IsNullOrWhiteSpace(location))
            {
                query = query.Where(e => e.Location.ToLower().Contains(location.ToLower()));
            }
            if (isFree.HasValue)
            {
                query = query.Where(e => e.isFree == isFree.Value);
            }
            if (startDate.HasValue)
            {
                var start = DateTime.SpecifyKind(startDate.Value, DateTimeKind.Utc);
                query = query.Where(e => e.StartDate >= start);
            }
            if (endDate.HasValue)
            {
                var end = DateTime.SpecifyKind(endDate.Value, DateTimeKind.Utc);
                query = query.Where(e => e.StartDate <= end);
            }
            if (hasTickets == true)
            {
                
                var eventIdsWithTickets = _context.Tickets
                    .Where(t => t.Quota > _context.UserTickets.Count(ut => ut.TicketID == t.TicketID))
                    .Select(t => t.EventID)
                    .Distinct()
                    .ToList();

                query = query.Where(e => eventIdsWithTickets.Contains(e.EventID));
            }
            if (!string.IsNullOrEmpty(sortBy) && sortBy.ToLower() == "price")
            {
                if (!string.IsNullOrEmpty(sortOrder) && sortOrder.ToLower() == "desc")
                    query = query.OrderByDescending(e => _context.Tickets.Where(t => t.EventID == e.EventID).Min(t => (decimal?)t.Price) ?? 0);
                else
                    query = query.OrderBy(e => _context.Tickets.Where(t => t.EventID == e.EventID).Min(t => (decimal?)t.Price) ?? 0);
            }
            else if (!string.IsNullOrEmpty(sortBy) && sortBy.ToLower() == "location")
            {
                if (!string.IsNullOrEmpty(sortOrder) && sortOrder.ToLower() == "desc")
                    query = query.OrderByDescending(e => e.Location);
                else
                    query = query.OrderBy(e => e.Location);
            }
            else if (!string.IsNullOrEmpty(sortBy) && sortBy.ToLower() == "title")
            {
                if (!string.IsNullOrEmpty(sortOrder) && sortOrder.ToLower() == "desc")
                    query = query.OrderByDescending(e => e.Title);
                else
                    query = query.OrderBy(e => e.Title);
            }
            else
            {
                
                if (!string.IsNullOrEmpty(sortOrder) && sortOrder.ToLower() == "desc")
                    query = query.OrderByDescending(e => e.StartDate);
                else
                    query = query.OrderBy(e => e.StartDate);
            }

            var attendingCounts = await _context.UserTickets
                .GroupBy(ut => ut.Ticket.EventID)
                .Select(g => new { EventID = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.EventID, x => x.Count);

            return await query
                //.OrderBy(e => e.StartDate)
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
