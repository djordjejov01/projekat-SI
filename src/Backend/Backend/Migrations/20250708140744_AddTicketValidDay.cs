using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddTicketValidDay : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ticketValidDays_Tickets_TicketID",
                table: "ticketValidDays");

            migrationBuilder.DropForeignKey(
                name: "FK_userResourceReservations_EventResources_EventResourceID",
                table: "userResourceReservations");

            migrationBuilder.DropForeignKey(
                name: "FK_userResourceReservations_UserTickets_UserTicketID",
                table: "userResourceReservations");

            migrationBuilder.DropForeignKey(
                name: "FK_userResourceReservations_Users_UserID",
                table: "userResourceReservations");

            migrationBuilder.DropPrimaryKey(
                name: "PK_userResourceReservations",
                table: "userResourceReservations");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ticketValidDays",
                table: "ticketValidDays");

            migrationBuilder.RenameTable(
                name: "userResourceReservations",
                newName: "UserResourceReservations");

            migrationBuilder.RenameTable(
                name: "ticketValidDays",
                newName: "TicketValidDays");

            migrationBuilder.RenameIndex(
                name: "IX_userResourceReservations_UserTicketID",
                table: "UserResourceReservations",
                newName: "IX_UserResourceReservations_UserTicketID");

            migrationBuilder.RenameIndex(
                name: "IX_userResourceReservations_UserID",
                table: "UserResourceReservations",
                newName: "IX_UserResourceReservations_UserID");

            migrationBuilder.RenameIndex(
                name: "IX_userResourceReservations_EventResourceID",
                table: "UserResourceReservations",
                newName: "IX_UserResourceReservations_EventResourceID");

            migrationBuilder.RenameIndex(
                name: "IX_ticketValidDays_TicketID",
                table: "TicketValidDays",
                newName: "IX_TicketValidDays_TicketID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserResourceReservations",
                table: "UserResourceReservations",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TicketValidDays",
                table: "TicketValidDays",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TicketValidDays_Tickets_TicketID",
                table: "TicketValidDays",
                column: "TicketID",
                principalTable: "Tickets",
                principalColumn: "TicketID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserResourceReservations_EventResources_EventResourceID",
                table: "UserResourceReservations",
                column: "EventResourceID",
                principalTable: "EventResources",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserResourceReservations_UserTickets_UserTicketID",
                table: "UserResourceReservations",
                column: "UserTicketID",
                principalTable: "UserTickets",
                principalColumn: "UserTicketID");

            migrationBuilder.AddForeignKey(
                name: "FK_UserResourceReservations_Users_UserID",
                table: "UserResourceReservations",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TicketValidDays_Tickets_TicketID",
                table: "TicketValidDays");

            migrationBuilder.DropForeignKey(
                name: "FK_UserResourceReservations_EventResources_EventResourceID",
                table: "UserResourceReservations");

            migrationBuilder.DropForeignKey(
                name: "FK_UserResourceReservations_UserTickets_UserTicketID",
                table: "UserResourceReservations");

            migrationBuilder.DropForeignKey(
                name: "FK_UserResourceReservations_Users_UserID",
                table: "UserResourceReservations");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserResourceReservations",
                table: "UserResourceReservations");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TicketValidDays",
                table: "TicketValidDays");

            migrationBuilder.RenameTable(
                name: "UserResourceReservations",
                newName: "userResourceReservations");

            migrationBuilder.RenameTable(
                name: "TicketValidDays",
                newName: "ticketValidDays");

            migrationBuilder.RenameIndex(
                name: "IX_UserResourceReservations_UserTicketID",
                table: "userResourceReservations",
                newName: "IX_userResourceReservations_UserTicketID");

            migrationBuilder.RenameIndex(
                name: "IX_UserResourceReservations_UserID",
                table: "userResourceReservations",
                newName: "IX_userResourceReservations_UserID");

            migrationBuilder.RenameIndex(
                name: "IX_UserResourceReservations_EventResourceID",
                table: "userResourceReservations",
                newName: "IX_userResourceReservations_EventResourceID");

            migrationBuilder.RenameIndex(
                name: "IX_TicketValidDays_TicketID",
                table: "ticketValidDays",
                newName: "IX_ticketValidDays_TicketID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_userResourceReservations",
                table: "userResourceReservations",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ticketValidDays",
                table: "ticketValidDays",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ticketValidDays_Tickets_TicketID",
                table: "ticketValidDays",
                column: "TicketID",
                principalTable: "Tickets",
                principalColumn: "TicketID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_userResourceReservations_EventResources_EventResourceID",
                table: "userResourceReservations",
                column: "EventResourceID",
                principalTable: "EventResources",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_userResourceReservations_UserTickets_UserTicketID",
                table: "userResourceReservations",
                column: "UserTicketID",
                principalTable: "UserTickets",
                principalColumn: "UserTicketID");

            migrationBuilder.AddForeignKey(
                name: "FK_userResourceReservations_Users_UserID",
                table: "userResourceReservations",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
