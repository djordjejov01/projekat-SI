using Microsoft.EntityFrameworkCore;
using backend_crud.Models;
namespace backend_crud.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Anime> animes { get; set; }
    }
}
