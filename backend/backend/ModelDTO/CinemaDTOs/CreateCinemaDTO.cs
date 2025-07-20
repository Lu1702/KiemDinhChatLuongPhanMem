namespace backend.ModelDTO.CinemaDTOs;

public class CreateCinemaDTO
{
    public string CinemaName { get; set; } = string.Empty;
    
    public string CinemaLocation { get; set; } = string.Empty;
    
    public string CinemaDescription { get; set; } = string.Empty;
    
    public string CinemaContactNumber { get; set; } = string.Empty;
}