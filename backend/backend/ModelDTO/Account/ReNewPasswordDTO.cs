using System.ComponentModel.DataAnnotations;

namespace backend.ModelDTO.Account;

public class ReNewPasswordDTO
{
    [Required(ErrorMessage = "Bắt buộc phải có ResetToken")]
    public string ResetToken { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Bắt buộc phải nhập mật khẩu mới")]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "Mật khẩu ít nhất phải 8 ký tự")]
    public string NewPassword { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Bắt buộc phải nhập mật khẩu xác nhận")]
    [Compare("ReNewPassword" , ErrorMessage = "Mật khẩu xác nhận không trùng với mật khẩu mới")]
    public string ReNewPassword { get; set; } = string.Empty;
}