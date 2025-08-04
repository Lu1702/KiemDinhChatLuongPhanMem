using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class Chinh_Lai_Tieng_Viet_The_Loai : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "movieGenre",
                keyColumn: "movieGenreId",
                keyValue: "a1a7b8c9-d0e1-f2a3-b4c5-d6e7f8a9b0c2",
                column: "movieGenreName",
                value: "Kinh dị");

            migrationBuilder.UpdateData(
                table: "movieGenre",
                keyColumn: "movieGenreId",
                keyValue: "b2b7b8c9-d0e1-f2a3-b4c5-d6e7f8a9b0c3",
                column: "movieGenreName",
                value: "Khoa học viễn tưởng");

            migrationBuilder.UpdateData(
                table: "movieGenre",
                keyColumn: "movieGenreId",
                keyValue: "c3c7b8c9-d0e1-f2a3-b4c5-d6e7f8a9b0c4",
                column: "movieGenreName",
                value: "Lãng mạng");

            migrationBuilder.UpdateData(
                table: "movieGenre",
                keyColumn: "movieGenreId",
                keyValue: "d4d7b8c9-d0e1-f2a3-b4c5-d6e7f8a9b0c5",
                column: "movieGenreName",
                value: "Hoạt hình");

            migrationBuilder.UpdateData(
                table: "movieGenre",
                keyColumn: "movieGenreId",
                keyValue: "e5f6a7b8-c9d0-e1f2-a3b4-c5d6e7f8a9b0",
                column: "movieGenreName",
                value: "Hành động");

            migrationBuilder.UpdateData(
                table: "movieGenre",
                keyColumn: "movieGenreId",
                keyValue: "f6a7b8c9-d0e1-f2a3-b4c5-d6e7f8a9b0c1",
                column: "movieGenreName",
                value: "Hài hước");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "movieGenre",
                keyColumn: "movieGenreId",
                keyValue: "a1a7b8c9-d0e1-f2a3-b4c5-d6e7f8a9b0c2",
                column: "movieGenreName",
                value: "Horror");

            migrationBuilder.UpdateData(
                table: "movieGenre",
                keyColumn: "movieGenreId",
                keyValue: "b2b7b8c9-d0e1-f2a3-b4c5-d6e7f8a9b0c3",
                column: "movieGenreName",
                value: "Sci-Fi");

            migrationBuilder.UpdateData(
                table: "movieGenre",
                keyColumn: "movieGenreId",
                keyValue: "c3c7b8c9-d0e1-f2a3-b4c5-d6e7f8a9b0c4",
                column: "movieGenreName",
                value: "Romance");

            migrationBuilder.UpdateData(
                table: "movieGenre",
                keyColumn: "movieGenreId",
                keyValue: "d4d7b8c9-d0e1-f2a3-b4c5-d6e7f8a9b0c5",
                column: "movieGenreName",
                value: "Animation");

            migrationBuilder.UpdateData(
                table: "movieGenre",
                keyColumn: "movieGenreId",
                keyValue: "e5f6a7b8-c9d0-e1f2-a3b4-c5d6e7f8a9b0",
                column: "movieGenreName",
                value: "Action");

            migrationBuilder.UpdateData(
                table: "movieGenre",
                keyColumn: "movieGenreId",
                keyValue: "f6a7b8c9-d0e1-f2a3-b4c5-d6e7f8a9b0c1",
                column: "movieGenreName",
                value: "Comedy");
        }
    }
}
