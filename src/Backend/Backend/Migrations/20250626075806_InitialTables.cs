using System;
using System.Data.SqlTypes;
using Backend.Models;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            

            migrationBuilder.CreateTable(
                name: "UserRoles",
                columns: table => new
                {
                    RoleId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RoleName = table.Column<string>(
                        type: "character varying(50)",
                        maxLength: 50,
                        nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRoles", x => x.RoleId);
                });
            //HACK - override OnModelBuilder instead!
            migrationBuilder.Sql(@"  
              INSERT INTO ""UserRoles""(""RoleId"", ""RoleName"") VALUES
                (0, 'Admin'),
                (1, 'Organizer'),
                (2, 'Supplier'),
                (3, 'MobileUser');
            ");

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Username = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Password = table.Column<string>(type: "text", nullable: false),
                    FirstName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    LastName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Role = table.Column<int>(type: "integer", nullable: false),
                    CreationTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserId);
                });

                migrationBuilder.CreateTable(
                    name: "Events",
                    columns: table => new
                    {
                        EventID = table.Column<int>(type: "integer", nullable: false)
                            .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                        OrganizerID = table.Column<int>(type: "integer", nullable: false),
                        Title = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                        Description = table.Column<string>(type: "text", nullable: false),
                        Location = table.Column<string>(type: "text", nullable: false),
                        StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                        EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                        NumberOfPeople = table.Column<int>(type: "integer", nullable: true),
                        TicketPrice = table.Column<int>(type: "integer", nullable: false)
                    },
                    constraints: table =>
                    {
                        table.PrimaryKey("PK_Events", x => x.EventID);
                        table.ForeignKey(
                            name: "FK_Events_Users_OrganizerID",
                            column: x => x.OrganizerID,
                            principalTable: "Users",
                            principalColumn: "UserId",
                            onDelete: ReferentialAction.Cascade);
                    });
                migrationBuilder.CreateTable(
                name: "EventActivities",
                columns: table => new
                {
                    ActivityID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EventID = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    StartTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventActivities", x => x.ActivityID);
                    table.ForeignKey(
                        name: "FK_EventActivities_Events_EventID",
                        column: x => x.EventID,
                        principalTable: "Events",
                        principalColumn: "EventID",
                        onDelete: ReferentialAction.Cascade);
                });
                migrationBuilder.CreateTable(
                    name: "Resources",
                    columns: table => new
                    {
                        ResourceID = table.Column<int>(type: "integer", nullable: false)
                            .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                        Name = table.Column<string>(type: "text", nullable: false),
                        Description = table.Column<string>(type: "text", nullable: false),
                        SupplierID = table.Column<int>(type: "integer", nullable: false),
                        Quantity = table.Column<int>(type: "integer", nullable: false)
                    },
                    constraints: table =>
                    {
                        table.PrimaryKey("PK_Resources", x => x.ResourceID);
                        table.ForeignKey(
                            name: "FK_Resources_Users_SupplierID",
                            column: x => x.SupplierID,
                            principalTable: "Users",
                            principalColumn: "UserId",
                            onDelete: ReferentialAction.Cascade);
                    });

                migrationBuilder.CreateTable(
                    name: "EventResources",
                    columns: table => new
                    {
                        ID = table.Column<int>(type: "integer", nullable: false)
                            .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                        SupplierID = table.Column<int>(type: "integer", nullable: false),
                        EventID = table.Column<int>(type: "integer", nullable: false),
                        Quantity = table.Column<int>(type: "integer", nullable: false),
                        Measure = table.Column<string>(type: "text", nullable: false)
                    },
                    constraints: table =>
                    {
                        table.PrimaryKey("PK_EventResources", x => x.ID);
                        table.ForeignKey(
                            name: "FK_EventResources_Events_EventID",
                            column: x => x.EventID,
                            principalTable: "Events",
                            principalColumn: "EventID",
                            onDelete: ReferentialAction.Cascade);
                        table.ForeignKey(
                            name: "FK_EventResources_Users_SupplierID",
                            column: x => x.SupplierID,
                            principalTable: "Users",
                            principalColumn: "UserId",
                            onDelete: ReferentialAction.Cascade);
                    });

                migrationBuilder.CreateTable(
                    name: "Tickets",
                    columns: table => new
                    {
                        TicketID = table.Column<int>(type: "integer", nullable: false)
                            .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                        EventID = table.Column<int>(type: "integer", nullable: false),
                        Price = table.Column<int>(type: "integer", nullable: false),
                        Quantity = table.Column<int>(type: "integer", nullable: false)
                    },
                    constraints: table =>
                    {
                        table.PrimaryKey("PK_Tickets", x => x.TicketID);
                        table.ForeignKey(
                            name: "FK_Tickets_Events_EventID",
                            column: x => x.EventID,
                            principalTable: "Events",
                            principalColumn: "EventID",
                            onDelete: ReferentialAction.Cascade);
                    });

                migrationBuilder.CreateTable(
                    name: "UserTickets",
                    columns: table => new
                    {
                        UserTicketID = table.Column<int>(type: "integer", nullable: false)
                            .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                        UserID = table.Column<int>(type: "integer", nullable: false),
                        TicketID = table.Column<int>(type: "integer", nullable: false),
                        PurchasedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                    },
                    constraints: table =>
                    {
                        table.PrimaryKey("PK_UserTickets", x => x.UserTicketID);
                        table.ForeignKey(
                            name: "FK_UserTickets_Tickets_TicketID",
                            column: x => x.TicketID,
                            principalTable: "Tickets",
                            principalColumn: "TicketID",
                            onDelete: ReferentialAction.Cascade);
                        table.ForeignKey(
                            name: "FK_UserTickets_Users_UserID",
                            column: x => x.UserID,
                            principalTable: "Users",
                            principalColumn: "UserId",
                            onDelete: ReferentialAction.Cascade);
                    });

                migrationBuilder.CreateIndex(
                    name: "IX_EventResources_EventID",
                    table: "EventResources",
                    column: "EventID");

                migrationBuilder.CreateIndex(
                    name: "IX_EventResources_SupplierID",
                    table: "EventResources",
                    column: "SupplierID");

                migrationBuilder.CreateIndex(
                    name: "IX_Events_OrganizerID",
                    table: "Events",
                    column: "OrganizerID");

                migrationBuilder.CreateIndex(
                    name: "IX_Resources_SupplierID",
                    table: "Resources",
                    column: "SupplierID");

                migrationBuilder.CreateIndex(
                    name: "IX_Tickets_EventID",
                    table: "Tickets",
                    column: "EventID");

                migrationBuilder.CreateIndex(
                    name: "IX_UserTickets_TicketID",
                    table: "UserTickets",
                    column: "TicketID");

                migrationBuilder.CreateIndex(
                    name: "IX_UserTickets_UserID",
                    table: "UserTickets",
                    column: "UserID");
            }
        

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EventActivities");

            migrationBuilder.DropTable(
                name: "EventResources");

            migrationBuilder.DropTable(
                name: "Resources");

            migrationBuilder.DropTable(
                name: "UserRoles");

            migrationBuilder.DropTable(
                name: "UserTickets");

            migrationBuilder.DropTable(
                name: "Tickets");

            migrationBuilder.DropTable(
                name: "Events");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
