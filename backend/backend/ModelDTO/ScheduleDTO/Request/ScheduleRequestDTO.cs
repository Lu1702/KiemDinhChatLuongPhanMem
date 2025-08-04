    namespace backend.ModelDTO.ScheduleDTO.Request
    {
        // Chọn rrạp Sau đó voi 
        // Chon Rap Truoc Sau Do Chon Phim , Sau do chon ngay , Sau do chon gio
        public class ScheduleRequestDTO
        {
            public string movieID { get; set; } = string.Empty;

            public List<ScheduleDateDTO> scheduleDateDTOs { get; set; } = [];

        }

        public class ScheduleDateDTO
        {
            public DateTime startDate { get; set; }

            public List<ScheduleVisualFormat> ScheduleVisualFormatDTOs { get; set; } = [];
        }

        public class ScheduleVisualFormat
        {
            public string visualFormatID {  get; set; } = string.Empty;

            public List<ScheduleShowTimeDTO> scheduleShowTimeDTOs { get; set; } = [];
        }

        public class ScheduleShowTimeDTO
        {
            public string showTimeID { get; set; } = string.Empty; 
            public string RoomId { get; set; } = string.Empty;
        }
        
    }
