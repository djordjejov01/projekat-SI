using Backend.Models;
using Backend.Models.Dto;

namespace Backend.Services
{
    public interface IEventService
    {
        Task<List<EventListDto>> SearchEventsAsync(string? name,EventCategory? category,string? location);
    }
}
