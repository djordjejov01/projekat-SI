using Microsoft.EntityFrameworkCore;

namespace Backend.Models
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<UserRoles> UserRoles {  get; set; }
        public DbSet<Event> Events { get; set; }
        public DbSet<EventActivity> EventActivities { get; set; }
        public DbSet<Resource> Resources { get; set; }
        public DbSet<EventResource> EventResources { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<UserTicket> UserTickets { get; set; }
        public DbSet<FavoriteEvent> FavoriteEvents { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        { 
            modelBuilder.Entity<Ticket>()
                .HasIndex(t => new { t.EventID, t.TypeName })
                .IsUnique();
        }
    }
} 