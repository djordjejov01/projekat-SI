using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class ResourceLogsTicketValidationResourceFixes : Migration
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

            migrationBuilder.AddColumn<bool>(
                name: "IsUsed",
                table: "UserTickets",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "UsedAt",
                table: "UserTickets",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ValidationToken",
                table: "UserTickets",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Category",
                table: "Resources",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "IsAvailable",
                table: "Resources",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsExhaustable",
                table: "Resources",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "EventResources",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsUsed",
                table: "UserTickets");

            migrationBuilder.DropColumn(
                name: "UsedAt",
                table: "UserTickets");

            migrationBuilder.DropColumn(
                name: "ValidationToken",
                table: "UserTickets");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "Resources");

            migrationBuilder.DropColumn(
                name: "IsAvailable",
                table: "Resources");

            migrationBuilder.DropColumn(
                name: "IsExhaustable",
                table: "Resources");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "EventResources");

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
