using System.ComponentModel.DataAnnotations;

namespace backend.ModelDTO.StaffDTOs;

public class CreateStaffDTO
{
    [Required]
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
    public string PhoneNumer { get; set; } = string.Empty;
    [Required]
    public string CinemaId { get; set; } = string.Empty;

    public List<string> RoleID { get; set; } = [];
}
