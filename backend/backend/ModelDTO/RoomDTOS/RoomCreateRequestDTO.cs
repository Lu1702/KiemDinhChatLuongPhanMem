using System.ComponentModel.DataAnnotations;

namespace backend.ModelDTO.RoomDTOS;

public class RoomCreateRequestDTO
{
    [Required(ErrorMessage = "Chưa có số phòng")]
    public int RoomNumber { get; set; } 
    [Required(ErrorMessage = "Chưa có ID rạp")]
    public string CinemaID { get; set; } = string.Empty;
    [Required(ErrorMessage = "Chưa có Định dạng hình ảnh")]

    public string VisualFormatID { get; set; } = string.Empty;

    [Required(ErrorMessage = "Chưa có ghế")]
    public List<string> SeatsNumber { get; set; } = [];

}