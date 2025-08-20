using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;

namespace Backend.Services
{
    public class EventLifecycleHostedService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        public EventLifecycleHostedService(IServiceScopeFactory scopeFactory) => _scopeFactory = scopeFactory;

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var interval = TimeSpan.FromMinutes(10);
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    var organizerService = scope.ServiceProvider.GetRequiredService<IOrganizerService>();

                    var now = DateTime.UtcNow;
                    var endedIds = await context.Events
                        .Where(e => e.Status == EventStatus.Published
                                 && e.ParentEventId == 0
                                 && e.EndDate <= now)
                        .Select(e => e.EventID)
                        .ToListAsync(stoppingToken);

                    foreach (var id in endedIds)
                    {
                        await organizerService.DeallocateEventResourcesForPublishedEvent(id);
                        var ev = await context.Events.FirstAsync(e => e.EventID == id, stoppingToken);
                        ev.Status = EventStatus.Finished;

                        var subEventIds = await context.Events
                            .Where(e => e.ParentEventId == id && e.Status == EventStatus.Published)
                            .Select(e => e.EventID)
                            .ToListAsync(stoppingToken);

                        foreach (var subId in subEventIds)
                        {
                            await organizerService.DeallocateEventResourcesForPublishedEvent(subId);
                            var subEv = await context.Events.FirstAsync(e => e.EventID == subId, stoppingToken);
                            subEv.Status = EventStatus.Finished;
                        }
                    }

                    if (endedIds.Count > 0)
                        await context.SaveChangesAsync(stoppingToken);
                }
                catch { /* log if you have a logger */ }

                await Task.Delay(interval, stoppingToken);
            }
        }
    }
}
