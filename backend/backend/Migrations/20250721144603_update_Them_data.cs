using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class update_Them_data : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "userInformation",
                columns: new[] { "userId", "loginUserEmail", "loginUserPassword" },
                values: new object[,]
                {
                    { "7b5d2c1e-9f8a-3e7b-c1d2-a0e9f8c7b6a5", "theater@example.com", "$2a$12$FeLXQjfW3gfNFfELxTJS3.gH8o9Y2CB5WSGcDZxKMrPEJiR2RcxIS" },
                    { "e4e1f7d8-c3b2-4a90-8c67-2f5a1b3d9e0c", "director@example.com", "$2a$12$91JfhncA5t3ssFtiaoKjSOrbMj7zON.wtL/n3cjme/wvK2kDCgZ7K" },
                    { "f1a0e9b8-d7c6-5e4f-a3b2-1d0c9b8a7f6e", "facilities@example.com", "$2a$12$CkugZHMrWhxG0h6hUqOAf.fX9QQFkLnfnLlI.xWCNZ1y/PivtfN2O" }
                });

            migrationBuilder.InsertData(
                table: "userRoleInformation",
                columns: new[] { "roleId", "userId" },
                values: new object[,]
                {
                    { "1a8f7b9c-d4e5-4f6a-b7c8-9d0e1f2a3b4c", "e4e1f7d8-c3b2-4a90-8c67-2f5a1b3d9e0c" },
                    { "3c0d9e1f-a6b7-c8d9-e0f1-2a3b4c5d6e7f", "e4e1f7d8-c3b2-4a90-8c67-2f5a1b3d9e0c" },
                    { "4d1e0f2a-b7c8-d9e0-f1a2-3b4c5d6e7f8g", "e4e1f7d8-c3b2-4a90-8c67-2f5a1b3d9e0c" },
                    { "5e2f1a3b-c8d9-e0f1-a2b3-4c5d6e7f8g9h", "7b5d2c1e-9f8a-3e7b-c1d2-a0e9f8c7b6a5" },
                    { "5e2f1a3b-c8d9-e0f1-a2b3-4c5d6e7f8g9h", "e4e1f7d8-c3b2-4a90-8c67-2f5a1b3d9e0c" },
                    { "6f3a2b4c-d9e0-f1a2-b3c4-d5e6f7a8b9c0", "e4e1f7d8-c3b2-4a90-8c67-2f5a1b3d9e0c" },
                    { "6f3a2b4c-d9e0-f1a2-b3c4-d5e6f7a8b9c0", "f1a0e9b8-d7c6-5e4f-a3b2-1d0c9b8a7f6e" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "userRoleInformation",
                keyColumns: new[] { "roleId", "userId" },
                keyValues: new object[] { "1a8f7b9c-d4e5-4f6a-b7c8-9d0e1f2a3b4c", "e4e1f7d8-c3b2-4a90-8c67-2f5a1b3d9e0c" });

            migrationBuilder.DeleteData(
                table: "userRoleInformation",
                keyColumns: new[] { "roleId", "userId" },
                keyValues: new object[] { "3c0d9e1f-a6b7-c8d9-e0f1-2a3b4c5d6e7f", "e4e1f7d8-c3b2-4a90-8c67-2f5a1b3d9e0c" });

            migrationBuilder.DeleteData(
                table: "userRoleInformation",
                keyColumns: new[] { "roleId", "userId" },
                keyValues: new object[] { "4d1e0f2a-b7c8-d9e0-f1a2-3b4c5d6e7f8g", "e4e1f7d8-c3b2-4a90-8c67-2f5a1b3d9e0c" });

            migrationBuilder.DeleteData(
                table: "userRoleInformation",
                keyColumns: new[] { "roleId", "userId" },
                keyValues: new object[] { "5e2f1a3b-c8d9-e0f1-a2b3-4c5d6e7f8g9h", "7b5d2c1e-9f8a-3e7b-c1d2-a0e9f8c7b6a5" });

            migrationBuilder.DeleteData(
                table: "userRoleInformation",
                keyColumns: new[] { "roleId", "userId" },
                keyValues: new object[] { "5e2f1a3b-c8d9-e0f1-a2b3-4c5d6e7f8g9h", "e4e1f7d8-c3b2-4a90-8c67-2f5a1b3d9e0c" });

            migrationBuilder.DeleteData(
                table: "userRoleInformation",
                keyColumns: new[] { "roleId", "userId" },
                keyValues: new object[] { "6f3a2b4c-d9e0-f1a2-b3c4-d5e6f7a8b9c0", "e4e1f7d8-c3b2-4a90-8c67-2f5a1b3d9e0c" });

            migrationBuilder.DeleteData(
                table: "userRoleInformation",
                keyColumns: new[] { "roleId", "userId" },
                keyValues: new object[] { "6f3a2b4c-d9e0-f1a2-b3c4-d5e6f7a8b9c0", "f1a0e9b8-d7c6-5e4f-a3b2-1d0c9b8a7f6e" });

            migrationBuilder.DeleteData(
                table: "userInformation",
                keyColumn: "userId",
                keyValue: "7b5d2c1e-9f8a-3e7b-c1d2-a0e9f8c7b6a5");

            migrationBuilder.DeleteData(
                table: "userInformation",
                keyColumn: "userId",
                keyValue: "e4e1f7d8-c3b2-4a90-8c67-2f5a1b3d9e0c");

            migrationBuilder.DeleteData(
                table: "userInformation",
                keyColumn: "userId",
                keyValue: "f1a0e9b8-d7c6-5e4f-a3b2-1d0c9b8a7f6e");
        }
    }
}
