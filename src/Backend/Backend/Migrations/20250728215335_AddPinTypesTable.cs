using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPinTypesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.CreateTable(
                name: "EventPin",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EventId = table.Column<int>(type: "integer", nullable: false),
                    Latitude = table.Column<double>(type: "double precision", nullable: false),
                    Longitude = table.Column<double>(type: "double precision", nullable: false),
                    Label = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    PinnedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PinCategory = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventPin", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PinTypes",
                columns: table => new
                {
                    PinTypeId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PinCategory = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PinTypes", x => x.PinTypeId);
                });

            migrationBuilder.InsertData(
                table: "PinTypes",
                columns: new[] { "PinTypeId", "PinCategory" },
                values: new object[,]
                {
                    { 1, "Booth" },
                    { 2, "Stage" },
                    { 3, "Entrance" },
                    { 4, "Exit" },
                    { 5, "FirstAid" },
                    { 6, "Food" },
                    { 7, "Drink" },
                    { 8, "Restroom" },
                    { 9, "Info" },
                    { 10, "Security" },
                    { 11, "Parking" },
                    { 12, "LostAndFound" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EventPin");

            migrationBuilder.DropTable(
                name: "PinTypes");
        }
    }
}