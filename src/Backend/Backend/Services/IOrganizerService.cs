using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Models.Dto;
namespace Backend.Services
{
    public interface IOrganizerService
    {
        List<Event> GetEventsForOrganier(int id);
        Task CreateEventForOrganizer(CreateEventDto model, int organizerID);
    }
}
