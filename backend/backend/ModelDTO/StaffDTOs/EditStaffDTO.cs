namespace backend.ModelDTO.StaffDTOs;

public class EditStaffDTO
{
    public string? StaffName { get; set; } = string.Empty;

    public DateTime? DateOfBirth { get; set; }

    public string? PhoneNumer { get; set; } = string.Empty;

    public string? CinemaId { get; set; } = string.Empty;
}