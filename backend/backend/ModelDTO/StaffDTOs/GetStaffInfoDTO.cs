namespace backend.ModelDTO.StaffDTOs;

public class GetStaffInfoDTO
{
    public string StaffId { get; set; } = string.Empty;
    
    public string StaffName { get; set; } = string.Empty;
    
    public string StaffPhoneNumber { get; set; } = string.Empty;
    
    public DateTime DayOfBirth { get; set; }
    
    public string CinenaName { get; set; } = string.Empty;
    
    public string CinemaId { get; set; } = string.Empty;
    
    public string StaffRole { get; set; } = string.Empty;
}