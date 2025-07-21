namespace backend.ModelDTO.RoomDTOS;

public class RoomEditRequestDTO
{
    public int ?RoomNumber { get; set; } 
    
    public string? CinemaID { get; set; } = string.Empty;
    
    public string? VisualFormatID { get; set; } = string.Empty;

    public List<string> SeatsNumber { get; set; } = [];
}