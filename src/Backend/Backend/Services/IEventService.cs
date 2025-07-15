using Backend.Models;
using Backend.Models.Dto;

namespace Backend.Services
{
    public interface IEventService
    {
        Task<List<EventListDto>> SearchEvents(string? name,EventCategory? category);
    }
}
