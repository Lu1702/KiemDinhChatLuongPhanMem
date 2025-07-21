using System.ComponentModel.DataAnnotations;

namespace backend.ModelDTO.StaffDTOs;

public class EditStaffDTO
{
    public string? StaffName { get; set; } = string.Empty;

    public DateTime? DateOfBirth { get; set; }
    [RegularExpression(@"^[0-9]{10}$", ErrorMessage = "Số điện thoại chỉ được chứa các chữ số và phải có đúng 10 chữ số.")]
    public string? PhoneNumer { get; set; } = string.Empty;

    public string? CinemaId { get; set; } = string.Empty;
    
    public List<string>? RoleID { get; set; } = [];
}