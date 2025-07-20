using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class update_Them_Bang_Staff_Order : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "StaffOrder",
                columns: table => new
                {
                    orderId = table.Column<string>(type: "varchar(100)", nullable: false),
                    paymentMethod = table.Column<string>(type: "varchar(50)", nullable: false),
                    PaymentStatus = table.Column<string>(type: "nvarchar(50)", nullable: false),
                    totalAmount = table.Column<long>(type: "bigint", nullable: false),
                    message = table.Column<string>(type: "nvarchar(200)", nullable: false),
                    paymentRequestCreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    StaffID = table.Column<string>(type: "varchar(100)", nullable: false),
                    CustomerName = table.Column<string>(type: "nvarchar(40)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StaffOrder", x => x.orderId);
                    table.ForeignKey(
                        name: "FK_StaffOrder_Staff_StaffID",
                        column: x => x.StaffID,
                        principalTable: "Staff",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StaffOrderDetailFoods",
                columns: table => new
                {
                    orderId = table.Column<string>(type: "varchar(100)", nullable: false),
                    foodInformationId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    quanlity = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StaffOrderDetailFoods", x => new { x.orderId, x.foodInformationId });
                    table.ForeignKey(
                        name: "FK_StaffOrderDetailFoods_StaffOrder_orderId",
                        column: x => x.orderId,
                        principalTable: "StaffOrder",
                        principalColumn: "orderId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StaffOrderDetailFoods_foodInformation_foodInformationId",
                        column: x => x.foodInformationId,
                        principalTable: "foodInformation",
                        principalColumn: "foodInformationId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StaffOrder_StaffID",
                table: "StaffOrder",
                column: "StaffID");

            migrationBuilder.CreateIndex(
                name: "IX_StaffOrderDetailFoods_foodInformationId",
                table: "StaffOrderDetailFoods",
                column: "foodInformationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StaffOrderDetailFoods");

            migrationBuilder.DropTable(
                name: "StaffOrder");
        }
    }
}
