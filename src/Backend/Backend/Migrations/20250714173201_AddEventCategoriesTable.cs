using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddEventCategoriesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EventCategories",
                columns: table => new
                {
                    CategoryID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CategoryName = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventCategories", x => x.CategoryID);
                });
            migrationBuilder.Sql(@"  
              INSERT INTO ""EventCategories""(""CategoryID"", ""CategoryName"") VALUES
                (0, 'Music'),
                (1, 'Sports'),
                (2, 'Entertainment'),
                (3, 'Protest'),
                (4,'Charity'),
                (5,'Business'),
                (6,'Culture'),
                (7,'Other');
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EventCategories");
        }
    }
}
