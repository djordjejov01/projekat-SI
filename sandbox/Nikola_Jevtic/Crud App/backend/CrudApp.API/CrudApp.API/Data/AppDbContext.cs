using Microsoft.EntityFrameworkCore;
using CrudApp.API.Models;

namespace CrudApp.API.Data
{
    public class AppDbContext : DbContext
    {

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Player> Players { get; set; }

       
    }
}
