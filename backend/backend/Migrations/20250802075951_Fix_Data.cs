using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class Fix_Data : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "foodImageURL",
                table: "foodInformation",
                type: "nvarchar(255)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.InsertData(
                table: "Staff",
                columns: new[] { "Id", "Name", "cinemaID", "dateOfBirth", "phoneNumber", "userID" },
                values: new object[,]
                {
                    { "d8d11645-73f0-4c54-a68e-88e8afe4c7e9", "Director Staff", "2f3a4b5c-6d7e-8f9a-0b1c-2d3e4f5a6b7c", new DateTime(1997, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "0123456789", "e4e1f7d8-c3b2-4a90-8c67-2f5a1b3d9e0c" },
                    { "f1eb0376-dfda-4570-85f9-021469e5593b", "Theater Manager Staff", "2f3a4b5c-6d7e-8f9a-0b1c-2d3e4f5a6b7c", new DateTime(1997, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "0123456789", "7b5d2c1e-9f8a-3e7b-c1d2-a0e9f8c7b6a5" }
                });

            migrationBuilder.UpdateData(
                table: "foodInformation",
                keyColumn: "foodInformationId",
                keyValue: "2d3e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a",
                column: "foodImageURL",
                value: "https://recipeforperfection.com/wp-content/uploads/2017/11/Movie-Theater-Popcorn-in-a-popcorn-bucket.jpg");

            migrationBuilder.UpdateData(
                table: "foodInformation",
                keyColumn: "foodInformationId",
                keyValue: "3e4f5a6b-7c8d-9e0f-1a2b-3c4d5e6f7a8b",
                column: "foodImageURL",
                value: "https://product.hstatic.net/1000230954/product/z5097801162745_cc1e0be47992663fe974e135fb0fe2dd_3696c0b4f0c6405982bd558d8f26e0fc_1024x1024.jpg");

            migrationBuilder.UpdateData(
                table: "foodInformation",
                keyColumn: "foodInformationId",
                keyValue: "4f5a6b7c-8d9e-0f1a-2b3c-4d5e6f7a8b9c",
                column: "foodImageURL",
                value: "https://www.stillwoodkitchen.com/wp-content/uploads/2023/02/DSC05431.jpg");

            migrationBuilder.UpdateData(
                table: "foodInformation",
                keyColumn: "foodInformationId",
                keyValue: "5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d",
                column: "foodImageURL",
                value: "https://backend.awrestaurants.com/sites/default/files/styles/responsive_image_5x4/public/2024-11/Hot-Dog-Hot-Dog_0.jpg?itok=PfAxxdhG");

            migrationBuilder.UpdateData(
                table: "movieInformation",
                keyColumn: "movieId",
                keyValue: "0d1e2f3a-4b5c-6d7e-8f9a-0b1c2d3e4f5a",
                columns: new[] { "movieImage", "movieTrailerUrl" },
                values: new object[] { "https://images.unsplash.com/flagged/photo-1577912504896-abc46b500434?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmxhZGUlMjBydW5uZXIlMjAyMDQ5fGVufDB8fDB8fHww", "https://youtu.be/bNRzyCm2uME" });

            migrationBuilder.UpdateData(
                table: "movieInformation",
                keyColumn: "movieId",
                keyValue: "1e2f3a4b-5c6d-7e8f-9a0b-1c2d3e4f5a6b",
                columns: new[] { "movieImage", "movieTrailerUrl" },
                values: new object[] { "https://media.wired.com/photos/59323c08aef9a462de9817dc/master/w_1800,h_1200,c_limit/ut_interstellarOpener_f.png", "https://youtu.be/yF2pXRJictA" });

            migrationBuilder.UpdateData(
                table: "movieInformation",
                keyColumn: "movieId",
                keyValue: "2f3a4b5c-6d7e-8f9a-0b1c2d3e4f5a6b7c",
                columns: new[] { "movieImage", "movieTrailerUrl" },
                values: new object[] { "https://www.tallengestore.com/cdn/shop/products/TINY_74e4fc80-aebb-484d-9025-014b40c61c8a.jpg?v=1530520655", "https://youtu.be/bMgfsdYoEEo" });

            migrationBuilder.UpdateData(
                table: "movieInformation",
                keyColumn: "movieId",
                keyValue: "3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d",
                columns: new[] { "movieImage", "movieTrailerUrl" },
                values: new object[] { "https://www.posterposse.com/wp-content/uploads/2017/10/Blad-Runner-2049_-Orlando-Arocena-mexifunk_vectorart_2017.png", "https://youtu.be/lbpduKrFRSc?feature=shared" });

            migrationBuilder.UpdateData(
                table: "movieInformation",
                keyColumn: "movieId",
                keyValue: "4b5c6d7e-8f9a-0b1c-2d3e-4f5a6b7c8d9e",
                columns: new[] { "movieImage", "movieTrailerUrl" },
                values: new object[] { "https://images.thedirect.com/media/article_full/superman-logo.jpg", "https://youtu.be/VLS9xSsfxkQ" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Staff",
                keyColumn: "Id",
                keyValue: "d8d11645-73f0-4c54-a68e-88e8afe4c7e9");

            migrationBuilder.DeleteData(
                table: "Staff",
                keyColumn: "Id",
                keyValue: "f1eb0376-dfda-4570-85f9-021469e5593b");

            migrationBuilder.DropColumn(
                name: "foodImageURL",
                table: "foodInformation");

            migrationBuilder.UpdateData(
                table: "movieInformation",
                keyColumn: "movieId",
                keyValue: "0d1e2f3a-4b5c-6d7e-8f9a-0b1c2d3e4f5a",
                columns: new[] { "movieImage", "movieTrailerUrl" },
                values: new object[] { "aa.com", "http://trailer.com/phimhanhdong1" });

            migrationBuilder.UpdateData(
                table: "movieInformation",
                keyColumn: "movieId",
                keyValue: "1e2f3a4b-5c6d-7e8f-9a0b-1c2d3e4f5a6b",
                columns: new[] { "movieImage", "movieTrailerUrl" },
                values: new object[] { "aa.com.vn", "http://trailer.com/comedyfilm1" });

            migrationBuilder.UpdateData(
                table: "movieInformation",
                keyColumn: "movieId",
                keyValue: "2f3a4b5c-6d7e-8f9a-0b1c2d3e4f5a6b7c",
                columns: new[] { "movieImage", "movieTrailerUrl" },
                values: new object[] { "conjuring.com", "http://trailer.com/conjuring" });

            migrationBuilder.UpdateData(
                table: "movieInformation",
                keyColumn: "movieId",
                keyValue: "3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d",
                columns: new[] { "movieImage", "movieTrailerUrl" },
                values: new object[] { "interstellar.com", "http://trailer.com/interstellar" });

            migrationBuilder.UpdateData(
                table: "movieInformation",
                keyColumn: "movieId",
                keyValue: "4b5c6d7e-8f9a-0b1c-2d3e-4f5a6b7c8d9e",
                columns: new[] { "movieImage", "movieTrailerUrl" },
                values: new object[] { "spiritedaway.com", "http://trailer.com/spiritedaway" });
        }
    }
}
