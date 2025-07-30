using Microsoft.EntityFrameworkCore;

namespace Backend.Models
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<UserRoles> UserRoles { get; set; }
        public DbSet<Event> Events { get; set; }
        public DbSet<EventActivity> EventActivities { get; set; }
        public DbSet<Resource> Resources { get; set; }
        public DbSet<EventResource> EventResources { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<UserTicket> UserTickets { get; set; }
        public DbSet<FavoriteEvent> FavoriteEvents { get; set; }
        public DbSet<UserResourceReservation> UserResourceReservations { get; set; }
        public DbSet<Organizer> Organizers { get; set; }
        public DbSet<EventCategories> EventCategories { get; set; }
        public DbSet<EventPin> EventPin { get; set; }

        public DbSet<PinType> PinTypes { get; set; }

        public DbSet<Supplier> Suppliers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Ticket>()
                .HasIndex(t => new { t.EventID, t.TypeName })
                .IsUnique();

            modelBuilder.Entity<EventCategories>()
               .Property(e => e.CategoryName)
               .HasConversion(
                   v => v.ToString(),
                   v => (EventCategory)Enum.Parse(typeof(EventCategory), v)
                );
            modelBuilder.Entity<PinType>().HasData(
                Enum.GetValues(typeof(PinTypes))
                    .Cast<PinTypes>()
                    .Select(e => new PinType
                    {
                        PinTypeId = (int)e+1,
                        PinCategory = e.ToString()
                    })
                    .ToArray()
            );
        }
    }
}
