using backend.Enum;
using backend.Interface.GenericsInterface;
using backend.ModelDTO.BookingHistoryDTO.OrderDetailRespond;
using backend.ModelDTO.BookingHistoryDTO.OrderRespond;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Timeouts;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingHistoryController : ControllerBase
    {
        private readonly GenericInterface<BookingHistoryRespondList, OrderDetailRespond> bookingHistoryList;

        public BookingHistoryController(GenericInterface<BookingHistoryRespondList, OrderDetailRespond> bookingHistoryList)
        {
            this.bookingHistoryList = bookingHistoryList;
        }

        [HttpGet("getBookingHistory/{userID}")]
        [Authorize(Policy = "Customer")]
        public async Task<IActionResult> getBookingHistoryLists(string userID)
        {
            var getLists = await bookingHistoryList.getAll(userID);

            if (getLists.Status.Equals(GenericStatusEnum.Success.ToString()))
            {
                return Ok(getLists);
            }

            return NotFound(new {message = "Lỗi rồi chúng tôi Không tìm thấy thông tin của bạn"});
        }

        [HttpGet("getBookingHistoryDetail/{orderID}")]
        [Authorize(Policy = "Customer")]
        public async Task<IActionResult> getBookingHistoryDetail(string orderID)
        {
            // Add Thêm services
            var getServices = await bookingHistoryList.getByID(orderID);
            return Ok(getServices);
        }
    }
}
