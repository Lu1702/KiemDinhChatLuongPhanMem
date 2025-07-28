namespace backend.ModelDTO.ScheduleDTO;

public class EditScheduleDTO
{
    public string? CinemaRoomId { get; set; } = string.Empty;
    
    public string? MovieId { get; set; } = String.Empty;
    
    public string? MovieVisualFormatId { get; set; } = string.Empty;
    
    public string? DayInWeekendSchedule { get; set; } = string.Empty;

    public string? HourScheduleId { get; set; } = string.Empty;
    
    public DateTime? ScheduleDate { get; set; }
    
}