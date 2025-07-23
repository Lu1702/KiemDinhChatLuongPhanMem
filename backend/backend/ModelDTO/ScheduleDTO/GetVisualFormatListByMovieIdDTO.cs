namespace backend.ModelDTO.ScheduleDTO;

public class GetVisualFormatListByMovieIdDTO
{
    public string MovieId { get; set; }

    public List<VisualFormatListDTO> VisualFormatLists { get; set; } = [];
}

public class VisualFormatListDTO
{
    public string VisualFormatId { get; set; } = string.Empty;
    
    public string VisualFormatName { get; set; } = string.Empty;
}