using backend.Interface;
using backend.Data;
using Microsoft.EntityFrameworkCore;
using backend.ModelDTO.BookingHistoryDTO.OrderDetailRespond;
using backend.Interface.GenericsInterface;
using backend.ModelDTO.Customer.OrderRespond;
using backend.ModelDTO.BookingHistoryDTO.OrderRespond;
using System.Security.Cryptography.Xml;
using backend.Enum;
using backend.ModelDTO.GenericRespond;

namespace backend.Services.BookingHistoryServices
{
    // Parameter của Generic thứ 1 là dạng List . dạng 2 là dạng chi tiết
    public class OrderDetailServices : GenericInterface<BookingHistoryRespondList, OrderDetailRespond>
    {
        private readonly DataContext _dataContext;

        public OrderDetailServices(DataContext dataContext)
        {
            _dataContext = dataContext;
        }

        public async Task<GenericRespondWithObjectDTO<List<BookingHistoryRespondList>>> getAll(string userID)
        {
            // Lấy OrderID
            var findCustomerID = _dataContext.Customers.FirstOrDefault
                (x => x.userID.Equals(userID));
            if (findCustomerID == null)
            {
                return new GenericRespondWithObjectDTO<List<BookingHistoryRespondList>>()
                {
                    Status = GenericStatusEnum.Failure.ToString(),
                    message = "Lỗi Không thấy thông tin khách hàng",
                };
            }
            var getOrderUserList = _dataContext.Order
                .Where(x => x.customerID.Equals(findCustomerID.Id)
                && x.PaymentStatus.Equals(PaymentStatus.PaymentSuccess.ToString()))
                .Select(x => x.orderId);
            var getTicketLists = await _dataContext.TicketOrderDetail
                .Where(x => getOrderUserList.Contains(x.orderId))
                .Include(tod => tod.movieSchedule) 
                    .ThenInclude(ms => ms.cinemaRoom) 
                        .ThenInclude(cr => cr.Cinema) 
                .Include(tod => tod.movieSchedule)
                    .ThenInclude(ms => ms.movieInformation) 
                .Include(tod => tod.movieSchedule)
                    .ThenInclude(ms => ms.HourSchedule) 
                .ToListAsync();

            // Tạo List để cho vào
            List<BookingHistoryRespondList> bookingHistoryRespondLists = new List<BookingHistoryRespondList>();
            foreach (var getTicketItems in getTicketLists)
            {
                string TrangThai = "Chưa chiếu";
                // Chuyển dạng 8:00 thành dạng thời gian để so sánh
                var convertToTimeSpan =
                    TimeSpan.ParseExact
                    (getTicketItems.movieSchedule.HourSchedule.HourScheduleShowTime, 
                    "h\\:mm", 
                    null);
                var convertToDateTime =
                    getTicketItems.movieSchedule.ScheduleDate.Add(convertToTimeSpan);
                var newBookingHistoryRespondList = new BookingHistoryRespondList()
                {
                    BookingId = getTicketItems.orderId,
                    cinemaName = getTicketItems.movieSchedule.cinemaRoom.Cinema.cinemaName,
                    cinemaRoomNumber = getTicketItems.movieSchedule.cinemaRoom.cinemaRoomNumber.ToString(),
                    HourSchedule = getTicketItems.movieSchedule.HourSchedule.HourScheduleShowTime,
                    movieName = getTicketItems.movieSchedule.movieInformation.movieName,
                    TrangThai = 
                    convertToDateTime > DateTime.Now ? "Chưa chiếu" : "Đã chiếu" ,
                    NgayChieu = getTicketItems.movieSchedule.ScheduleDate.ToString("yyy/MM/dd"),
                };
                bookingHistoryRespondLists
                    .Add(newBookingHistoryRespondList);
            }
            return new GenericRespondWithObjectDTO<List<BookingHistoryRespondList>>()
            {
                Status = GenericStatusEnum.Success.ToString() ,
                message = "Thông tin" ,
                data = bookingHistoryRespondLists
            };
        }

        public async Task<OrderDetailRespond> getByID(string orderID)
        {
            // Dùng Include và then Include

            var getOrderDetail = _dataContext.Order
                .FirstOrDefault(y => y.orderId.Equals(orderID));
            var getCustomerInfo = _dataContext.Order.Include(x => x.Customer);
            var getOrderDetailTicket = _dataContext.TicketOrderDetail
                .Where(x => x.orderId.Equals(getOrderDetail.orderId))
                .Include(x => x.movieSchedule).ThenInclude(x => x.movieInformation)
                .Include(x => x.movieSchedule).ThenInclude(x => x.HourSchedule);

            // Trả về kết quả
            // Chỉ trả về một cái thôi
            // Khai báo biến

            string customerName = string.Empty;
            string phoneNumber = string.Empty;
            string movieName = string.Empty;
            DateTime scheduleDate = new DateTime();
            string cinemaName = string.Empty;
            string scheduleShowTime = string.Empty;
            Dictionary<string, int> productLists = [];
            int cinemaRoom = 0;
            bool Status = false;
            string seatList = string.Empty;

            // Trả về tên khách hàng Order
            var getCustomerInfoObject = getCustomerInfo.FirstOrDefault();

            // Trả về số điện thoại

            if (getCustomerInfoObject != null)
            {
                customerName = getCustomerInfoObject.Customer.Name;
               phoneNumber = getCustomerInfoObject.Customer.phoneNumber;
            }

            // Trả về thông tin phim

            var getOrderInfo = getOrderDetailTicket.FirstOrDefault();

            if (getOrderInfo != null)
            {
                // Lấy thông tin ghế người dùng đã đặt

                var _getSeatsNumber = _dataContext.TicketOrderDetail
                    .Include(x => x.Seats).Where(x => x.orderId.Equals(orderID));
                var getSeatsNumber = String.Join(",", _getSeatsNumber.Select(x => x.Seats.seatsNumber));
                seatList = getSeatsNumber.ToString();
                var getScheduleInfo = getOrderInfo.movieSchedule;
                if (getScheduleInfo != null)
                {
                    scheduleDate = getScheduleInfo.ScheduleDate;



                    // Tiếp tục lọc ra danh sách Giờ chiếu và phòng và Rạp và chọn ra nếu nó chiếu hoặc chưa
                    // 

                    // Lấy ra tên rạp
                    var getCinemaName = _dataContext.TicketOrderDetail
                   .Include(x => x.movieSchedule)
                   .ThenInclude(x => x.cinemaRoom)
                   .ThenInclude(x => x.Cinema)
                   .Where(x => x.orderId.Equals(orderID)).FirstOrDefault();

                    movieName = getCinemaName.movieSchedule.movieInformation.movieName;

                    cinemaName = getCinemaName.movieSchedule.cinemaRoom.Cinema.cinemaName;

                    // Lấy thông tin giờ chiếu

                    scheduleShowTime = getScheduleInfo.HourSchedule.HourScheduleShowTime;

                    // Convert sang dạng TimeSpan

                    var convertToTimeSpan =
                    TimeSpan.ParseExact
                    (scheduleShowTime,
                    "h\\:mm",
                    null);

                    // Convert sang dạng Giờ ngày

                    var convertToDateTime =
                        scheduleDate.Add(convertToTimeSpan);
                    // Lấy thông tin phòng

                    if (DateTime.Now > convertToDateTime)
                    {
                        Status = true;
                    }

                    cinemaRoom = getScheduleInfo.cinemaRoom.cinemaRoomNumber;

                    //Lấy ra danh sách sản phẩm người dùng Order

                    var getProductLists = _dataContext.FoodOrderDetail
                        .Include(x => x.foodInformation)
                        .Where(x => x.orderId.Equals(orderID));

                    // Chuyển thành dạng Dictionary
                    if (getProductLists.Any())
                    {
                        var selectQuanlity = 
                            getProductLists.ToDictionary
                                (x => x.foodInformation.foodInformationName, x => x.quanlity);

                        productLists = selectQuanlity;
                    }
                    
                    // Tạo object mới

                    var newOrderDetailRespondDTO = new OrderDetailRespond()
                    {
                        cinemaName = cinemaName,
                        cinemaRoomNumber = cinemaRoom,
                        customerName = customerName,
                        movieName = movieName,
                        movieScheduleDate = scheduleDate,
                        phoneNumber = phoneNumber,
                        ProductList = productLists,
                        scheduleShowTIme = scheduleShowTime,
                        SeatsNumber = seatList ,
                        ShowStatus = Status ?  ScheduleEnum.screened.ToString() : ScheduleEnum.notScreened.ToString(),
                    };

                    return newOrderDetailRespondDTO;
                }
            }
            return new OrderDetailRespond()
            {

            };
        }
    }
}
