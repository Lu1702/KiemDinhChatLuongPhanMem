namespace backend.ModelDTO.ScheduleDTO;

public class GetListScheduleDTO
{
    public string MovieName { get; set; } = string.Empty;

    public List<GetMovieScheduleDTO> getListSchedule { get; set; } = [];
}

public class GetMovieScheduleDTO
{
    public string ScheduleId { get; set; } = string.Empty;
    
    public string CinemaName { get; set; } = string.Empty;
    
    public string MovieVisualFormatInfo { get; set; } = string.Empty;
    
    public string ShowTime { get; set; } = string.Empty;
    
    public DateTime ShowDate { get; set; }
    
    public int CinemaRoom { get; set; } 
}