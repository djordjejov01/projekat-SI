using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Models.Dto;
namespace Backend.Services
{
    public interface IOrganizerService
    {
        List<Event> GetAllEventsForOrganier(int id);
        List<Event> GetUpcomingEventsForOrganier(int id);
        Task<EventsSubeventsActivitiesDto> GetEventSubeventsActivities(int id);
        Task CreateEventForOrganizer(CreateEventDto model, int organizerID);
    }
}
