using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Model.Auth;

namespace backend.Model.Email;

public class EmailList
{
    [Key]
    public string EmailId { get; set; } = string.Empty;
    
    [ForeignKey("userInformation")]
    public string UserId { get; set; } = string.Empty;
    
        
    public string EmailCode { get; set; } = string.Empty;
    
    public bool isUsed { get; set; } = false;
    
    public string ResetToken { get; set; } = string.Empty;
    
    public DateTime CreatedDate { get; set; }
    
    public DateTime ExpirationDate { get; set; }

    public userInformation userInformation { get; set; } = null!;
}