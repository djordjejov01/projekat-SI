using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddResourceLogTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Resources_Users_SupplierID",
                table: "Resources");

            migrationBuilder.DropIndex(
                name: "IX_Resources_SupplierID",
                table: "Resources");

            migrationBuilder.DropColumn(
                name: "Measurment",
                table: "Resources");

            migrationBuilder.DropColumn(
                name: "Measure",
                table: "EventResources");

            migrationBuilder.AddColumn<DateTime>(
                name: "EndDateTimeBooked",
                table: "EventResources",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "StartDateTimeBooked",
                table: "EventResources",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ResourceLog",
                columns: table => new
                {
                    LogID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ResourceID = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Category = table.Column<int>(type: "integer", nullable: false),
                    IsExhaustable = table.Column<bool>(type: "boolean", nullable: false),
                    IsAvailable = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    SupplierID = table.Column<int>(type: "integer", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    LogDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResourceLog", x => x.LogID);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ResourceLog");

            migrationBuilder.DropColumn(
                name: "EndDateTimeBooked",
                table: "EventResources");

            migrationBuilder.DropColumn(
                name: "StartDateTimeBooked",
                table: "EventResources");

            migrationBuilder.AddColumn<int>(
                name: "Measurment",
                table: "Resources",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Measure",
                table: "EventResources",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Resources_SupplierID",
                table: "Resources",
                column: "SupplierID");

            migrationBuilder.AddForeignKey(
                name: "FK_Resources_Users_SupplierID",
                table: "Resources",
                column: "SupplierID",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
