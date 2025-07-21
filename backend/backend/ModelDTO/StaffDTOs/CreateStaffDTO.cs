using System.ComponentModel.DataAnnotations;

namespace backend.ModelDTO.StaffDTOs;

public class CreateStaffDTO
{
    [Required]
    [EmailAddress(ErrorMessage = "Invalid Email Address")]
    public string LoginUserEmail { get; set; } = string.Empty;
    [Required]
    public string LoginUserPassword { get; set; } = string.Empty;
    [Required]
    [Compare("LoginUserPassword")]
    public string LoginUserPasswordConfirm { get; set; } = string.Empty;
    [Required]
    public string StaffName { get; set; } = string.Empty;
    [Required]
    public DateTime DateOfBirth { get; set; }
    
    [Required]
    [RegularExpression(@"^[0-9]{10}$", ErrorMessage = "Số điện thoại chỉ được chứa các chữ số và phải có đúng 10 chữ số.")]
    public string PhoneNumer { get; set; } = string.Empty;
    [Required]
    public string CinemaId { get; set; } = string.Empty;

    public List<string> RoleID { get; set; } = [];
}
