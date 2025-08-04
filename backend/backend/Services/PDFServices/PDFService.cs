using backend.Enum;
using backend.Interface.PDFInterface;
using backend.ModelDTO.GenericRespond;
using backend.ModelDTO.PDFDTO;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace backend.Services.PDFServices;

public class PDFService : IPDFService<GenerateCustomerBookingDTO,GenerateStaffBookingDTO>{

    public GenericRespondWithObjectDTO<PDFRespondDTO> GeneratePdfUserOrder(GenerateCustomerBookingDTO userOrder)
    {
        var newGuidToString = Guid.NewGuid().ToString();
        QuestPDF.Settings.License = LicenseType.Community;
        var PDFData =  Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(30);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header()
                    .Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text("XÁC NHẬN ĐẶT VÉ").FontSize(20).Bold();
                            col.Item().Text($"Ngày đặt: {userOrder.BookingDate:dd/MM/yyyy HH:mm}");
                            col.Item().Text($"Email khách hàng: {userOrder.CustomerEmail}");
                        });
                     });

                page.Content()
                    .PaddingVertical(10)
                    .Column(column =>
                    {
                        column.Spacing(10);

                        // Thông tin vé
                        column.Item().Text("THÔNG TIN VÉ PHIM").FontSize(14).Bold();
                        column.Item().Border(1).Padding(5).Column(col =>
                        {
                            col.Item().Text($"Tên phim: {userOrder.BookingInfo.MovieName}");
                            col.Item().Text($"Rạp: {userOrder.BookingInfo.CinemaLocation} - Phòng {userOrder.BookingInfo.RoomNumber}");
                            col.Item().Text($"Định dạng: {userOrder.BookingInfo.VisualFormat}");
                            col.Item().Text($"Ngày chiếu: {userOrder.BookingInfo.ShowedDate:dd/MM/yyyy HH:mm}");
                            
                            // Sửa phần hiển thị thông tin ghế để duyệt qua danh sách
                            col.Item().PaddingTop(5).Text("Chi tiết vé:").Bold();
                            foreach (var seatGroup in userOrder.BookingInfo.Seats)
                            {
                                col.Item().Text($" - Số ghế: {seatGroup.SeatsNumber}");
                                col.Item().Text($" - Giá vé mỗi ghế: {seatGroup.PriceEachSeat:N0} VNĐ");
                            }
                        });

                        // Thông tin sản phẩm đi kèm (nếu có)
                        if (userOrder.BookingInfo.Products.Any())
                        {
                            column.Item().PaddingTop(10).Text("SẢN PHẨM ĐI KÈM").FontSize(14).Bold();
                            column.Item().Table(table =>
                            {
                                // Định nghĩa các cột cho bảng sản phẩm
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.RelativeColumn(); // Product Name
                                    columns.ConstantColumn(60); // Quantity
                                    columns.ConstantColumn(100); // Price Each
                                    columns.ConstantColumn(100); // Total
                                });

                                // Header của bảng
                                table.Header(header =>
                                {
                                    header.Cell().Text("Sản phẩm").Bold();
                                    header.Cell().AlignRight().Text("SL").Bold();
                                    header.Cell().AlignRight().Text("Đơn giá").Bold();
                                    header.Cell().AlignRight().Text("Thành tiền").Bold();
                                });

                                // Duyệt qua từng sản phẩm và thêm vào bảng
                                foreach (var product in userOrder.BookingInfo.Products)
                                {
                                    table.Cell().Text(product.ProductName);
                                    table.Cell().AlignRight().Text(product.Quality.ToString());
                                    table.Cell().AlignRight().Text($"{product.PriceEachProduct:N0} VNĐ");
                                    table.Cell().AlignRight().Text($"{product.Quality * product.PriceEachProduct:N0} VNĐ");
                                }
                            });
                        }

                        // Tổng cộng
                        column.Item().AlignRight().PaddingTop(20).Text($"TỔNG CỘNG: {userOrder.BookingInfo.TotalPrice:N0} VNĐ").FontSize(16).Bold();

                        column.Item().PaddingTop(20).Text("Cảm ơn quý khách đã đặt vé!").AlignCenter();
                    });

                page.Footer()
                    .AlignCenter()
                    .Text(x =>
                    {
                        x.Span("Trang ").FontSize(8);
                        x.CurrentPageNumber().FontSize(8);
                        x.Span(" / ").FontSize(8);
                        x.TotalPages().FontSize(8);
                    });
            });
        }).GeneratePdf();

        return new GenericRespondWithObjectDTO<PDFRespondDTO>()
        {
            message = "Thành công",
            Status = GenericStatusEnum.Success.ToString(),
            data = new PDFRespondDTO()
            {
                data = PDFData,
                FileName = $"CustomerBookingInfo.{newGuidToString}.pdf"
            }
        };
    }

    public GenericRespondWithObjectDTO<PDFRespondDTO> GeneratePdfStaffOrder(GenerateStaffBookingDTO staffOrder)
    {
        var newGuidToString = Guid.NewGuid().ToString();
        QuestPDF.Settings.License = LicenseType.Community;
        var PDFData =  Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(30);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header()
                    .Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text("ID nhân nhân viên đã tạo thanh toán").FontSize(20).Bold();
                            col.Item().Text($"Ngày đặt: {staffOrder.OrderDate:dd/MM/yyyy HH:mm}");
                            col.Item().Text($"Email khách hàng: {staffOrder.UserName}");
                        });
                     });

                page.Content()
                    .PaddingVertical(10)
                    .Column(column =>
                    {
                        column.Spacing(10);

                        // Thông tin sản phẩm đi kèm (nếu có)
                        if (staffOrder.OrderRespondProducts.Any())
                        {
                            column.Item().PaddingTop(10).Text("Đơn hàng").FontSize(14).Bold();
                            column.Item().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.RelativeColumn(); 
                                    columns.ConstantColumn(60);
                                    columns.ConstantColumn(100); 
                                    columns.ConstantColumn(100);
                                });

                                table.Header(header =>
                                {
                                    header.Cell().Text("Sản phẩm").Bold();
                                    header.Cell().AlignRight().Text("SL").Bold();
                                    header.Cell().AlignRight().Text("Đơn giá").Bold();
                                    header.Cell().AlignRight().Text("Thành tiền").Bold();
                                });

                                // Duyệt qua từng sản phẩm và thêm vào bảng
                                foreach (var product in staffOrder.OrderRespondProducts)
                                {
                                    table.Cell().Text(product.ProductName);
                                    table.Cell().AlignRight().Text(product.Quantity.ToString());
                                    table.Cell().AlignRight().Text($"{product.productSinglePrice} VNĐ");
                                    table.Cell().AlignRight().Text($"{product.productTotalAmount}");
                                }
                            });
                        }

                        // Tổng cộng
                        column.Item().AlignRight().PaddingTop(20).Text($"TỔNG CỘNG: {staffOrder.TotalPriceAllProducts:N0} VNĐ").FontSize(16).Bold();

                        column.Item().PaddingTop(20).Text("Cảm ơn quý khách đã đặt vé!").AlignCenter();
                    });

                page.Footer()
                    .AlignCenter()
                    .Text(x =>
                    {
                        x.Span("Trang ").FontSize(8);
                        x.CurrentPageNumber().FontSize(8);
                        x.Span(" / ").FontSize(8);
                        x.TotalPages().FontSize(8);
                    });
            });
        }).GeneratePdf();

        return new GenericRespondWithObjectDTO<PDFRespondDTO>()
        {
            message = "Thành công",
            Status = GenericStatusEnum.Success.ToString(),
            data = new PDFRespondDTO()
            {
                data = PDFData,
                FileName = $"CustomerBookingInfo.{newGuidToString}.pdf"
            }
        };
    }
}