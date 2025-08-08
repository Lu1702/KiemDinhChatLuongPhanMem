namespace backend.ModelDTO.BookingHistoryDTO.OrderRespond
{
    public class BookingHistoryRespondList
    {
        // Phòng chiếu phim
        public string BookingId { get; set; } = string.Empty;
        public string cinemaRoomNumber { get; set; } = string.Empty;

        // Thông tin của rạp chiếu phim nơi đang xem phim

        public string cinemaName { get; set; } = string.Empty;

        // Tên phim
        public string movieName { get; set; } = string.Empty;

        // Trạng thái : Đã chiếu và chưa chiếu

        public string TrangThai { get; set; } = string.Empty;

        // Ngày chiếu

        public string NgayChieu { get; set; } = string.Empty;


        // Giờ chiếu của phim

        public string HourSchedule { get; set; } = string.Empty;
    }
}
