using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class Them_Column_IsDelete_O_Cinema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "isDeleted",
                table: "Cinema",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "Cinema",
                keyColumn: "cinemaId",
                keyValue: "2f3a4b5c-6d7e-8f9a-0b1c-2d3e4f5a6b7c",
                column: "isDeleted",
                value: false);

            migrationBuilder.UpdateData(
                table: "Cinema",
                keyColumn: "cinemaId",
                keyValue: "5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f",
                column: "isDeleted",
                value: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "isDeleted",
                table: "Cinema");
        }
    }
}
