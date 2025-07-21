namespace backend.ModelDTO.CinemaDTOs;

public class GetCinemaDetailBookingDTO
{
    public DateTime ScheduleDate { get; set; }

    public List<CinemaBookingDTO> CinemaBookings { get; set; } = [];
}

public class CinemaBookingDTO
{
    public string CinemaID { get; set; } = string.Empty;
    
    public string CinemaName { get; set; } = string.Empty;
    
    public string CinemaLocation { get; set; } = string.Empty;

    public List<ScheduleShowTimeWithCinemaDTO> ScheduleShowTimeWithCinemaDtos { get; set; } = [];
}
public class ScheduleShowTimeWithCinemaDTO
{
    public string HourScheduleID { get; set; } = string.Empty;
    
    public string HourScheduleDetail { get; set; } = string.Empty;
}
