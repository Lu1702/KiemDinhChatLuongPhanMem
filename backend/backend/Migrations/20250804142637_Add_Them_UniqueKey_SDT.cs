using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class Add_Them_UniqueKey_SDT : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "foodEachPrice",
                table: "StaffOrderDetailFoods",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateIndex(
                name: "IX_Staff_phoneNumber",
                table: "Staff",
                column: "phoneNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Customers_phoneNumber",
                table: "Customers",
                column: "phoneNumber",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Staff_phoneNumber",
                table: "Staff");

            migrationBuilder.DropIndex(
                name: "IX_Customers_phoneNumber",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "foodEachPrice",
                table: "StaffOrderDetailFoods");
        }
    }
}
