using backend.Data;
using backend.Enum;
using backend.Helper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Web;
using backend.Interface.EmailInterface;
using backend.Interface.PDFInterface;
using backend.ModelDTO.Customer.OrderRespond;
using backend.ModelDTO.PDFDTO;
using backend.Services.PDFServices;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc.Formatters; // For HttpUtility.UrlDecode
using VNPAY.NET.Enums;
using VNPAY.NET.Models;
using VNPAY.NET.Utilities;

namespace backend.Controllers
{
    [Route("Vnpay")]
    [ApiController]
    public class VnpayController : ControllerBase
    {
        private readonly DataContext _dataContext;

        private readonly IPDFService<GenerateCustomerBookingDTO, GenerateStaffBookingDTO> IPDF;
        
        private readonly IEmailService _emailService;

        public VnpayController(DataContext dataContext, IPDFService<GenerateCustomerBookingDTO, GenerateStaffBookingDTO> IPDF , IEmailService _emailService) 
        {
            this._dataContext = dataContext;
            this.IPDF = IPDF;
            this._emailService = _emailService;
        }
        [HttpGet("IPN")]
        public async Task<IActionResult> IPN()
        {
            var queryParams = HttpContext.Request.Query;

            var vnpAmount = queryParams["vnp_Amount"].ToString();
            var vnpBankCode = queryParams["vnp_BankCode"].ToString();
            var vnpBankTranNo = queryParams["vnp_BankTranNo"].ToString();
            var vnpCardType = queryParams["vnp_CardType"].ToString();
            var vnpOrderInfo = queryParams["vnp_OrderInfo"].ToString();
            var vnpPayDate = queryParams["vnp_PayDate"].ToString();
            var vnpResponseCode = queryParams["vnp_ResponseCode"].ToString();
            var vnpTmnCode = queryParams["vnp_TmnCode"].ToString();
            var vnpTxnRef = queryParams["vnp_TxnRef"].ToString(); // vnp_TxnRef is often the OrderId you sent
            var vnpTransactionNo = queryParams["vnp_TransactionNo"].ToString();


            if (string.IsNullOrEmpty(vnpAmount) ||
                string.IsNullOrEmpty(vnpBankCode) ||
                string.IsNullOrEmpty(vnpBankTranNo) ||
                string.IsNullOrEmpty(vnpCardType) ||
                string.IsNullOrEmpty(vnpOrderInfo) ||
                string.IsNullOrEmpty(vnpPayDate) ||
                string.IsNullOrEmpty(vnpResponseCode) ||
                string.IsNullOrEmpty(vnpTmnCode) ||
                string.IsNullOrEmpty(vnpTxnRef) ||
                string.IsNullOrEmpty(vnpTransactionNo))
            {
                Console.WriteLine("Null rồi");
                // Return a Bad Request if any essential parameter is missing.
                return BadRequest("Missing one or more required VNPAY callback parameters. Please check the URL.");
            }

            // ---
            // Process the VNPAY response code to get a human-readable message
            // ---
            string responseMessage = string.Empty;
            switch (vnpResponseCode)
            {
                case "00":
                    responseMessage = "Giao dịch thành công";
                    break;
                case "07":
                    responseMessage = "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)";
                    break;
                case "09":
                    responseMessage = "Thẻ hoặc tài khoản chưa đăng ký dịch vụ Internet Banking tại ngân hàng";
                    break;
                case "10":
                    responseMessage = "Xác thực thông tin thẻ hoặc tài khoản không đúng quá 3 lần";
                    break;
                case "11":
                    responseMessage = "Hết hạn chờ thanh toán";
                    break;
                case "12":
                    responseMessage = "Thẻ hoặc tài khoản ngân hàng của quý khách bị khóa";
                    break;
                case "13":
                    responseMessage = "Mã OTP không chính xác";
                    break;
                case "24":
                    responseMessage = "Giao dịch bị hủy bởi người dùng";
                    break;
                case "51":
                    responseMessage = "Tài khoản của không đủ số dư để thực hiện giao dịch";
                    break;
                case "65":
                    responseMessage = "Tài khoản đã vượt quá hạn mức giao dịch trong ngày";
                    break;
                case "75":
                    responseMessage = "Ngân hàng thanh toán đang bảo trì";
                    break;
                case "79":
                    responseMessage = "Nhập sai mật khẩu thanh toán quá số lần quy định";
                    break;
                case "99":
                    responseMessage = "Lỗi không xác định";
                    break;
                default:
                    responseMessage = "Mã trạng thái không xác định.";
                    break;
            }

            long amountParsed;
            if (!long.TryParse(vnpAmount, out amountParsed))
            {
                return BadRequest("Invalid amount received from VNPAY.");
            }

            var getOrderID = _dataContext.Order.FirstOrDefault
                (x => x.orderId.Equals(vnpTxnRef));
            if (getOrderID != null)
            {
                try
                {
                    if (vnpResponseCode != "00")
                    {
                        getOrderID.PaymentStatus = PaymentStatus.PaymentFailure.ToString();
                        getOrderID.message = responseMessage;
                        var getOrderSeats = _dataContext.TicketOrderDetail.Where
                            (x => x.orderId.Equals(vnpTxnRef)).Select(x => x.seatsId);
                        if (getOrderSeats.Any())
                        {
                            // Update Seats
                            var getSeats = _dataContext.Seats.Where(x => getOrderSeats.Contains(x.seatsId));
                            foreach (var seat in getSeats)
                            {
                                seat.isTaken = false;
                            }
                            _dataContext.Seats.UpdateRange(getSeats);
                        }
                        _dataContext.Order.Update(getOrderID);
                        await _dataContext.SaveChangesAsync();
                    }
                    getOrderID.PaymentStatus = PaymentStatus.PaymentSuccess.ToString();
                    getOrderID.message = responseMessage;
                    
                    _dataContext.Order.Update(getOrderID);
                    await _dataContext.SaveChangesAsync();

                    if (vnpResponseCode == "00")
                    {
                        // Tiếp tục làm các Services
                        var getCustomerOrderInfo = _dataContext.Order
                            .FirstOrDefault(x => x.orderId.Equals(getOrderID.orderId));
                        var getStaffOrderInfo = _dataContext.StaffOrder
                            .FirstOrDefault(x => x.orderId.Equals(getOrderID.orderId));
                        if (getCustomerOrderInfo != null)
                        {
                            var getCustomerOrderTicketInfo
                                = _dataContext.TicketOrderDetail.Where(
                                    x => x.orderId.Equals(getCustomerOrderInfo.orderId));
                            var getCustomerOrderProductInfo =
                                _dataContext.FoodOrderDetail.Where(
                                    x => x.orderId.Equals(getCustomerOrderInfo.orderId));
                            var getCustomerInfo = _dataContext.Customers
                                .FirstOrDefault(x => x.Id.Equals(getCustomerOrderInfo
                                    .customerID));
                            var getMovieScheduleInfo = _dataContext
                                .movieSchedule.Include(movieSchedule => movieSchedule.cinemaRoom)
                                .ThenInclude(cinemaRoom => cinemaRoom.Cinema)
                                .Include(movieSchedule => movieSchedule.movieVisualFormat).FirstOrDefault(x =>
                                    getCustomerOrderTicketInfo
                                        .Select(x => x.movieScheduleID).Contains(x.movieScheduleId));
                            if (getCustomerInfo != null && getMovieScheduleInfo != null)
                            {
                                var getUserInfo =
                                    _dataContext.userInformation
                                        .FirstOrDefault(x => x.userId
                                            .Equals(getCustomerInfo.userID));
                                if (getUserInfo != null)
                                {
                                    var getMovieInfo =
                                        _dataContext.movieInformation
                                            .FirstOrDefault(x => x.movieId.Equals(getMovieScheduleInfo
                                                .movieId));
                                    var groupBySelectionTickets =
                                        getCustomerOrderTicketInfo.GroupBy(x => x.PriceEach);
                                    var selectedElement =
                                        groupBySelectionTickets.Select
                                        (x => new GenerateCustomerBookingTicketSeatsInfo
                                        {
                                            PriceEachSeat = x.Key,
                                            SeatsNumber = String.Join("," , x.Select(y => y.Seats.seatsNumber))
                                        }).ToList();
                                    var generateCustomerBookingProductsInfos = getCustomerOrderProductInfo.Select(x =>
                                        new GenerateCustomerBookingProductsInfo()
                                        {
                                            ProductName = x.foodInformation.foodInformationName,
                                            Quality = x.quanlity,
                                            PriceEachProduct = x.PriceEach
                                        }).ToList();
                                    var generateCustomerBookingTicketInfo =
                                        new GenerateCustomerBookingTicketInfo()
                                        {
                                            MovieName = getMovieInfo.movieName,
                                            CinemaLocation = getMovieScheduleInfo.cinemaRoom.Cinema.cinemaName,
                                            RoomNumber = getMovieScheduleInfo.cinemaRoom.cinemaRoomNumber,
                                            VisualFormat = getMovieScheduleInfo.movieVisualFormat.movieVisualFormatName,
                                            ShowedDate = getMovieScheduleInfo.ScheduleDate,
                                            Seats = selectedElement ,
                                        };
                                    decimal TotalPrice = 0;
                                    TotalPrice += selectedElement.Sum(x => x.PriceEachSeat);
                                    if (generateCustomerBookingProductsInfos.Any())
                                    {
                                        // Tiếp tục thêm data vào Model để gửi EMail
                                        generateCustomerBookingTicketInfo.Products = generateCustomerBookingProductsInfos;
                                        TotalPrice += generateCustomerBookingTicketInfo.Products.Sum(x => x.PriceEachProduct);
                                    }
                                    generateCustomerBookingTicketInfo.TotalPrice = TotalPrice;
                                    var newCustomerInfo =
                                        new GenerateCustomerBookingDTO()
                                        {
                                            CustomerEmail = getUserInfo.loginUserEmail,
                                            BookingDate = getCustomerOrderInfo.paymentRequestCreatedDate,
                                            BookingInfo = generateCustomerBookingTicketInfo,
                                            
                                        };
                                    var generatePDF =
                                        IPDF.GeneratePdfUserOrder(newCustomerInfo);
                                    if (generatePDF.Status.Equals(GenericStatusEnum.Success.ToString()))
                                    {
                                        var getStaffInfo = _dataContext.Staff
                                            .FirstOrDefault(x => x.Id.Equals(getCustomerOrderInfo.customerID));
                                       var getStatus =  await _emailService
                                           .SendPdf(newCustomerInfo.CustomerEmail , generatePDF.data!);
                                       if (getStatus.Status.Equals(GenericStatusEnum.Failure.ToString()))
                                       {
                                           Console.WriteLine("Looix");
                                       }
                                    }
                                }
                            }
                            
                            
                        }else if (getStaffOrderInfo != null)
                        {
                            // Lays data thông tin StaffOrder
                            var getProductInfo =
                                _dataContext.StaffOrderDetailFoods
                                    .Where(x => x.Equals(getOrderID.orderId));
                            // Update trong DB
                            if (vnpResponseCode == "00")
                            {
                                getStaffOrderInfo.PaymentStatus = GenericStatusEnum.Success.ToString();
                            }
                            else
                            {
                                getStaffOrderInfo.PaymentStatus = GenericStatusEnum.Failure.ToString();
                            }
                            _dataContext.StaffOrder.Update(getStaffOrderInfo);
                            await _dataContext.SaveChangesAsync();

                            if (getStaffOrderInfo.CustomerName != null)
                            {
                                if (getProductInfo.Any())
                                {
                                    var GetStaffInfo =
                                        _dataContext.Staff.FirstOrDefault(x => x.Id.Equals(getStaffOrderInfo
                                            .StaffID));
                                    var newListOrderRespondProductsInfo =
                                        getProductInfo.Select
                                        (x => new OrderRespondProductsInfo()
                                        {
                                            ProductName = x.foodInformation.foodInformationName,
                                            productSinglePrice = x.foodEachPrice,
                                            Quantity = x.quanlity,
                                            productTotalAmount = x.foodEachPrice * x.quanlity
                                        }).ToList();
                                    var newGenerateStaffBookingDTO = new GenerateStaffBookingDTO()
                                    {
                                        StaffId = GetStaffInfo.Id,
                                        UserName = getStaffOrderInfo.CustomerName,
                                        OrderDate = getStaffOrderInfo.paymentRequestCreatedDate,
                                        OrderRespondProducts = newListOrderRespondProductsInfo,
                                        TotalPriceAllProducts = newListOrderRespondProductsInfo.Sum(x => x.productTotalAmount)
                                    };
                                    var GeneatePDFData = IPDF.GeneratePdfStaffOrder(newGenerateStaffBookingDTO);

                                    await _emailService.SendPdf(newGenerateStaffBookingDTO.UserName,
                                        GeneatePDFData.data);
                                }
                            }
                            
                            else
                            {
                                return NotFound("Không tìm thấy thông tin Order của Staff");
                            }
                        }
                    }

                    return Ok("Cập nhật thành công");
                }
                catch (Exception ex) 
                {
                    Console.WriteLine(ex.ToString());
                }
            }
            return BadRequest("Không tìm thấy orderID");
        }

        [HttpGet("getPaymentStatus/{orderID}")]
        public IActionResult getPaymentStatus(string orderID)
        {
            var findOrderID = _dataContext.Order.FirstOrDefault(x => x.orderId.Equals(orderID));
            if (findOrderID != null) 
            {
                return BadRequest();
            }
            return Ok(findOrderID);
        }

        [HttpGet("CallbackURL")]
        public IActionResult VnpayCallBackURL()
        {
            // Get all query parameters from the HTTP context
            var queryParams = HttpContext.Request.Query;

            // Extract values, handling potential nulls from the query string
            // We use GetValueOrDefault to assign string.Empty if a parameter is missing,
            // which simplifies null checks later for strings.
            var vnpAmount = queryParams["vnp_Amount"].ToString();
            var vnpBankCode = queryParams["vnp_BankCode"].ToString();
            var vnpBankTranNo = queryParams["vnp_BankTranNo"].ToString();
            var vnpCardType = queryParams["vnp_CardType"].ToString();
            var vnpOrderInfo = queryParams["vnp_OrderInfo"].ToString();
            var vnpPayDate = queryParams["vnp_PayDate"].ToString();
            var vnpResponseCode = queryParams["vnp_ResponseCode"].ToString();
            var vnpTmnCode = queryParams["vnp_TmnCode"].ToString();
            var vnpTxnRef = queryParams["vnp_TxnRef"].ToString(); // vnp_TxnRef is often the OrderId you sent
            var vnpTransactionNo = queryParams["vnp_TransactionNo"].ToString();

            // ---
            // Input Validation: Check for required parameters
            // This ensures we have all the data before proceeding.
            // ---
            if (string.IsNullOrEmpty(vnpAmount) ||
                string.IsNullOrEmpty(vnpBankCode) ||
                string.IsNullOrEmpty(vnpCardType) ||
                string.IsNullOrEmpty(vnpOrderInfo) ||
                string.IsNullOrEmpty(vnpPayDate) ||
                string.IsNullOrEmpty(vnpResponseCode) ||
                string.IsNullOrEmpty(vnpTmnCode) ||
                string.IsNullOrEmpty(vnpTxnRef) ||
                string.IsNullOrEmpty(vnpTransactionNo))
            {
                Console.WriteLine("Null rồi");
                return BadRequest("Missing one or more required VNPAY callback parameters. Please check the URL.");
            }   
            // ---
            // Process the VNPAY response code to get a human-readable message
            // ---
            string responseMessage = string.Empty;
            switch (vnpResponseCode)
            {
                case "00":
                    responseMessage = "Giao dịch thành công";
                    break;
                case "02":
                    responseMessage = "Bạn đã hủy giao dịch";
                    break;
                case "07":
                    responseMessage = "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)";
                    break;
                case "09":
                    responseMessage = "Thẻ hoặc tài khoản chưa đăng ký dịch vụ Internet Banking tại ngân hàng";
                    break;
                case "10":
                    responseMessage = "Xác thực thông tin thẻ hoặc tài khoản không đúng quá 3 lần";
                    break;
                case "11":
                    responseMessage = "Hết hạn chờ thanh toán";
                    break;
                case "12":
                    responseMessage = "Thẻ hoặc tài khoản ngân hàng của quý khách bị khóa";
                    break;
                case "13":
                    responseMessage = "Mã OTP không chính xác";
                    break;
                case "24":
                    responseMessage = "Giao dịch bị hủy bởi người dùng";
                    break;
                case "51":
                    responseMessage = "Tài khoản của không đủ số dư để thực hiện giao dịch";
                    break;
                case "65":
                    responseMessage = "Tài khoản đã vượt quá hạn mức giao dịch trong ngày";
                    break;
                case "75":
                    responseMessage = "Ngân hàng thanh toán đang bảo trì";
                    break;
                case "79":
                    responseMessage = "Nhập sai mật khẩu thanh toán quá số lần quy định";
                    break;
                case "99":
                    responseMessage = "Lỗi không xác định";
                    break;
                default:
                    responseMessage = "Mã trạng thái không xác định.";
                    break;
            }
            long amountParsed;
            if (!long.TryParse(vnpAmount, out amountParsed))
            {
                return BadRequest("Invalid amount received from VNPAY.");
            }

            string url = "http://localhost:3000/VNPAY/PaymentStatus?" +
                            $"success={(vnpResponseCode == "00" ? "true" : "false")}" +
                            $"&code={vnpResponseCode}" +
                            $"&message={responseMessage}" +
                            $"&transactionNo={vnpTransactionNo}" +
                            $"&orderInfo={HttpUtility.UrlDecode(vnpOrderInfo)}" +
                            $"&bankCode={vnpBankCode}";
            var newUri = new Uri(url);
            return Redirect(newUri.AbsoluteUri);
        }
    }
}