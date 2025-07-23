using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class Fix_Lai_Kieu_Du_Lieu_DB : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "minimumAgeInfo",
                table: "minimumAges",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.UpdateData(
                table: "minimumAges",
                keyColumn: "minimumAgeID",
                keyValue: "6a7b8c9d-0e1f-2a3b-4c5d-6e7f8a9b0c1d",
                column: "minimumAgeInfo",
                value: "P");

            migrationBuilder.UpdateData(
                table: "minimumAges",
                keyColumn: "minimumAgeID",
                keyValue: "7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
                column: "minimumAgeInfo",
                value: "T13");

            migrationBuilder.UpdateData(
                table: "minimumAges",
                keyColumn: "minimumAgeID",
                keyValue: "8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e",
                column: "minimumAgeInfo",
                value: "T16");

            migrationBuilder.UpdateData(
                table: "minimumAges",
                keyColumn: "minimumAgeID",
                keyValue: "9c0d1e2f-3a4b-5c6d-7e8f-9a0b1c2d3e4f",
                column: "minimumAgeInfo",
                value: "T18");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "minimumAgeInfo",
                table: "minimumAges",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.UpdateData(
                table: "minimumAges",
                keyColumn: "minimumAgeID",
                keyValue: "6a7b8c9d-0e1f-2a3b-4c5d-6e7f8a9b0c1d",
                column: "minimumAgeInfo",
                value: 0);

            migrationBuilder.UpdateData(
                table: "minimumAges",
                keyColumn: "minimumAgeID",
                keyValue: "7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
                column: "minimumAgeInfo",
                value: 13);

            migrationBuilder.UpdateData(
                table: "minimumAges",
                keyColumn: "minimumAgeID",
                keyValue: "8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e",
                column: "minimumAgeInfo",
                value: 16);

            migrationBuilder.UpdateData(
                table: "minimumAges",
                keyColumn: "minimumAgeID",
                keyValue: "9c0d1e2f-3a4b-5c6d-7e8f-9a0b1c2d3e4f",
                column: "minimumAgeInfo",
                value: 18);
        }
    }
}
