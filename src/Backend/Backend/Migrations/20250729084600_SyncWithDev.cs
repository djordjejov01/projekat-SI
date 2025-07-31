using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class SyncWithDev : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            /*migrationBuilder.CreateIndex(
                name: "IX_EventActivities_EventID",
                table: "EventActivities",
                column: "EventID");

            migrationBuilder.AddForeignKey(
                name: "FK_EventActivities_Events_EventID",
                table: "EventActivities",
                column: "EventID",
                principalTable: "Events",
                principalColumn: "EventID",
                onDelete: ReferentialAction.Cascade);*/
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EventActivities_Events_EventID",
                table: "EventActivities");

            migrationBuilder.DropIndex(
                name: "IX_EventActivities_EventID",
                table: "EventActivities");
        }
    }
}
