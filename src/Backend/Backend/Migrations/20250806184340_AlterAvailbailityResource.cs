using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AlterAvailbailityResource : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1) drop the old bool
            migrationBuilder.DropColumn(
                name: "IsAvailable",
                table: "Resources");

            // 2) add the new enum (integer) column
            migrationBuilder.AddColumn<int>(
                name: "Availability",
                table: "Resources",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            // … your Measure column addition, etc.
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // reverse: drop Availability, re-add IsAvailable
            migrationBuilder.DropColumn(name: "Availability", table: "Resources");

            migrationBuilder.AddColumn<bool>(
                name: "IsAvailable",
                table: "Resources",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            // … reverse your Measure column changes, etc.
        }
    }
}
