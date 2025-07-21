using System.ComponentModel.DataAnnotations;

namespace backend.ModelDTO.RoomDTOS;

public class RoomCreateRequestDTO
{
    [Required]
    public int RoomNumber { get; set; } 
    [Required]
    public string CinemaID { get; set; } = string.Empty;
    [Required]
    public string VisualFormatID { get; set; } = string.Empty;
    
    [Required]
    public List<string> SeatsNumber { get; set; } = [];

}