using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddIsReservableToEventResource : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsReservable",
                table: "EventResources",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "ResourceID",
                table: "EventResources",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_EventResources_ResourceID",
                table: "EventResources",
                column: "ResourceID");

            migrationBuilder.AddForeignKey(
                name: "FK_EventResources_Resources_ResourceID",
                table: "EventResources",
                column: "ResourceID",
                principalTable: "Resources",
                principalColumn: "ResourceID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EventResources_Resources_ResourceID",
                table: "EventResources");

            migrationBuilder.DropIndex(
                name: "IX_EventResources_ResourceID",
                table: "EventResources");

            migrationBuilder.DropColumn(
                name: "IsReservable",
                table: "EventResources");

            migrationBuilder.DropColumn(
                name: "ResourceID",
                table: "EventResources");
        }
    }
}
